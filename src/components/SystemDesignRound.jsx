import { useState, useEffect, useRef } from 'react';
import { MessageSquare, Send, Loader2, CheckCircle2, User, Bot, Pencil, Square, Circle, ArrowRight, Type, Trash2, Move, Hand } from 'lucide-react';

export default function SystemDesignRound({ assessmentId, onComplete }) {
  const [roundId, setRoundId] = useState(null);
  const [problem, setProblem] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [currentPhase, setCurrentPhase] = useState('requirements');
  const [status, setStatus] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const messagesEndRef = useRef(null);

  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentTool, setCurrentTool] = useState('pen');
  const [currentColor, setCurrentColor] = useState('#00ff9d');
  const [components, setComponents] = useState([]);
  const [drawingElements, setDrawingElements] = useState([]);
  const [selectedElement, setSelectedElement] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    setTimeout(() => setIsVisible(true), 100);
    startSystemDesign();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (roundId) {
      const interval = setInterval(() => {
        fetchStatus();
      }, 10000);
      return () => clearInterval(interval);
    }
  }, [roundId]);

  useEffect(() => {
    drawCanvas();
  }, [components, drawingElements, selectedElement]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const startSystemDesign = async () => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:8000/assessments/${assessmentId}/system_design/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) throw new Error('Failed to start system design round');

      const data = await response.json();
      setRoundId(data.round_id);
      setProblem(data.problem);
      setCurrentPhase(data.current_phase);

      if (data.initial_message) {
        setMessages([{ role: 'interviewer', content: data.initial_message, timestamp: new Date() }]);
      }
    } catch (error) {
      console.error('Error starting system design:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStatus = async () => {
    try {
      const response = await fetch(`http://localhost:8000/assessments/system_design/${roundId}/status`);
      if (!response.ok) throw new Error('Failed to fetch status');

      const data = await response.json();
      setStatus(data);
      setCurrentPhase(data.current_phase);
    } catch (error) {
      console.error('Error fetching status:', error);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || sendingMessage) return;

    const userMessage = { role: 'candidate', content: inputMessage, timestamp: new Date() };
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setSendingMessage(true);

    try {
      const response = await fetch(`http://localhost:8000/assessments/system_design/${roundId}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: inputMessage })
      });

      if (!response.ok) throw new Error('Failed to send message');

      const data = await response.json();
      if (data.interviewer_response) {
        setMessages(prev => [...prev, {
          role: 'interviewer',
          content: data.interviewer_response,
          timestamp: new Date()
        }]);
      }

      if (data.current_phase) {
        setCurrentPhase(data.current_phase);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => [...prev, {
        role: 'interviewer',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date()
      }]);
    } finally {
      setSendingMessage(false);
    }
  };

  const updateDiagram = async () => {
    try {
      const response = await fetch(`http://localhost:8000/assessments/system_design/${roundId}/diagram`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ components })
      });

      if (!response.ok) throw new Error('Failed to update diagram');
    } catch (error) {
      console.error('Error updating diagram:', error);
    }
  };

  const completeRound = async () => {
    setLoading(true);
    try {
      await updateDiagram();

      const response = await fetch(`http://localhost:8000/assessments/system_design/${roundId}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) throw new Error('Failed to complete round');

      const result = await response.json();
      onComplete(result);
    } catch (error) {
      console.error('Error completing round:', error);
    } finally {
      setLoading(false);
    }
  };

  const drawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#0a0f1e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const gridSize = 20;
    ctx.strokeStyle = '#1a2332';
    ctx.lineWidth = 1;
    for (let x = 0; x < canvas.width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }

    drawingElements.forEach(element => {
      ctx.strokeStyle = element.color;
      ctx.fillStyle = element.color;
      ctx.lineWidth = 2;

      if (element.type === 'line') {
        ctx.beginPath();
        ctx.moveTo(element.points[0].x, element.points[0].y);
        for (let i = 1; i < element.points.length; i++) {
          ctx.lineTo(element.points[i].x, element.points[i].y);
        }
        ctx.stroke();
      }
    });

    components.forEach((comp, idx) => {
      const isSelected = selectedElement === idx;

      ctx.strokeStyle = isSelected ? '#00ff9d' : comp.color;
      ctx.fillStyle = comp.backgroundColor || 'rgba(0, 255, 157, 0.1)';
      ctx.lineWidth = isSelected ? 3 : 2;

      if (comp.type === 'rectangle' || comp.type === 'database' || comp.type === 'server') {
        ctx.fillRect(comp.x, comp.y, comp.width, comp.height);
        ctx.strokeRect(comp.x, comp.y, comp.width, comp.height);
      } else if (comp.type === 'circle' || comp.type === 'cache') {
        const radius = Math.min(comp.width, comp.height) / 2;
        ctx.beginPath();
        ctx.arc(comp.x + comp.width / 2, comp.y + comp.height / 2, radius, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();
      }

      if (comp.label) {
        ctx.fillStyle = '#ffffff';
        ctx.font = '14px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(comp.label, comp.x + comp.width / 2, comp.y + comp.height / 2);
      }

      if (comp.connections) {
        comp.connections.forEach(targetId => {
          const target = components.find(c => c.id === targetId);
          if (target) {
            ctx.strokeStyle = '#00d4ff';
            ctx.lineWidth = 2;
            ctx.setLineDash([5, 5]);
            ctx.beginPath();
            ctx.moveTo(comp.x + comp.width / 2, comp.y + comp.height / 2);
            ctx.lineTo(target.x + target.width / 2, target.y + target.height / 2);
            ctx.stroke();
            ctx.setLineDash([]);
          }
        });
      }
    });
  };

  const handleCanvasMouseDown = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (currentTool === 'select') {
      const clickedIdx = components.findIndex(comp =>
        x >= comp.x && x <= comp.x + comp.width &&
        y >= comp.y && y <= comp.y + comp.height
      );

      if (clickedIdx !== -1) {
        setSelectedElement(clickedIdx);
        const comp = components[clickedIdx];
        setDragOffset({ x: x - comp.x, y: y - comp.y });
        setIsDrawing(true);
      } else {
        setSelectedElement(null);
      }
    } else if (currentTool === 'pen') {
      setIsDrawing(true);
      setDrawingElements(prev => [...prev, {
        type: 'line',
        points: [{ x, y }],
        color: currentColor
      }]);
    } else {
      setIsDrawing(true);
      const newComponent = {
        id: `comp_${Date.now()}`,
        type: currentTool,
        x,
        y,
        width: 0,
        height: 0,
        color: currentColor,
        backgroundColor: 'rgba(0, 255, 157, 0.1)',
        label: '',
        connections: []
      };
      setComponents(prev => [...prev, newComponent]);
    }
  };

  const handleCanvasMouseMove = (e) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (currentTool === 'select' && selectedElement !== null) {
      setComponents(prev => prev.map((comp, idx) =>
        idx === selectedElement
          ? { ...comp, x: x - dragOffset.x, y: y - dragOffset.y }
          : comp
      ));
    } else if (currentTool === 'pen') {
      setDrawingElements(prev => {
        const updated = [...prev];
        const current = updated[updated.length - 1];
        current.points.push({ x, y });
        return updated;
      });
    } else {
      setComponents(prev => {
        const updated = [...prev];
        const current = updated[updated.length - 1];
        current.width = x - current.x;
        current.height = y - current.y;
        return updated;
      });
    }
  };

  const handleCanvasMouseUp = () => {
    setIsDrawing(false);
    if (currentTool !== 'pen' && currentTool !== 'select') {
      updateDiagram();
    }
  };

  const addComponent = (type, label) => {
    const newComponent = {
      id: `comp_${Date.now()}`,
      type,
      x: 100 + Math.random() * 200,
      y: 100 + Math.random() * 200,
      width: 120,
      height: 80,
      color: currentColor,
      backgroundColor: 'rgba(0, 255, 157, 0.1)',
      label,
      connections: []
    };
    setComponents(prev => [...prev, newComponent]);
    updateDiagram();
  };

  const clearCanvas = () => {
    setComponents([]);
    setDrawingElements([]);
    setSelectedElement(null);
  };

  const getPhaseColor = (phase) => {
    const phases = {
      'requirements': 'text-cyan-glow',
      'high_level': 'text-accent-1',
      'data_modeling': 'text-neon-green',
      'deep_dive': 'text-blue-400',
      'tradeoffs': 'text-purple-400'
    };
    return phases[phase] || 'text-muted-white/60';
  };

  if (loading && !roundId) {
    return (
      <section className="relative min-h-screen py-20 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-accent-1 animate-spin mx-auto mb-4" />
          <p className="text-muted-white/70">Preparing system design interview...</p>
        </div>
      </section>
    );
  }

  return (
    <section className="relative min-h-screen py-20 px-4 sm:px-6 lg:px-8">
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-accent-1/30 rounded-full blur-3xl"></div>
      </div>

      <div
        className={`relative z-10 max-w-[1600px] mx-auto transition-all duration-1000 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}
      >
        <div className="mb-8">
          <div className="flex items-center justify-between flex-wrap gap-4 mb-4">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-effect border border-cyan-glow/30 mb-4">
                <Pencil className="w-4 h-4 text-neon-green" />
                <span className="text-sm text-muted-white/90">System Design Round</span>
              </div>
              <h2 className="text-4xl sm:text-5xl font-bold text-muted-white text-shadow-hero mb-2">
                {problem?.title || 'System Design Interview'}
              </h2>
              <p className="text-muted-white/70 text-lg">
                Category: <span className="text-accent-1 font-semibold">{problem?.category}</span> |
                Difficulty: <span className="text-neon-green font-semibold ml-2">{problem?.difficulty}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 mb-4">
            <span className="text-muted-white/60 text-sm">Phase:</span>
            {['requirements', 'high_level', 'data_modeling', 'deep_dive', 'tradeoffs'].map((phase, idx) => (
              <div key={phase} className="flex items-center gap-2">
                <div className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                  currentPhase === phase
                    ? `${getPhaseColor(phase)} bg-accent-1/20 border border-accent-1/30`
                    : 'text-muted-white/40 bg-bg-darker/30 border border-grid-blue/20'
                }`}>
                  {phase.replace('_', ' ')}
                </div>
                {idx < 4 && <ArrowRight className="w-3 h-3 text-muted-white/30" />}
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2 space-y-6">
            <div className="glass-effect rounded-2xl p-6 border border-grid-blue/20 shadow-card-shadow">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-muted-white">Whiteboard</h3>
                <div className="flex items-center gap-2">
                  <button
                    onClick={clearCanvas}
                    className="p-2 rounded-lg glass-effect border border-grid-blue/30 hover:border-red-400/50 transition-all"
                    title="Clear Canvas"
                  >
                    <Trash2 className="w-4 h-4 text-red-400" />
                  </button>
                </div>
              </div>

              <div className="mb-4 flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => setCurrentTool('select')}
                  className={`p-2 rounded-lg border transition-all ${
                    currentTool === 'select'
                      ? 'bg-accent-1 border-accent-1 text-white'
                      : 'glass-effect border-grid-blue/30 text-muted-white hover:border-accent-1/50'
                  }`}
                  title="Select"
                >
                  <Hand className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setCurrentTool('pen')}
                  className={`p-2 rounded-lg border transition-all ${
                    currentTool === 'pen'
                      ? 'bg-accent-1 border-accent-1 text-white'
                      : 'glass-effect border-grid-blue/30 text-muted-white hover:border-accent-1/50'
                  }`}
                  title="Pen"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setCurrentTool('rectangle')}
                  className={`p-2 rounded-lg border transition-all ${
                    currentTool === 'rectangle'
                      ? 'bg-accent-1 border-accent-1 text-white'
                      : 'glass-effect border-grid-blue/30 text-muted-white hover:border-accent-1/50'
                  }`}
                  title="Rectangle"
                >
                  <Square className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setCurrentTool('circle')}
                  className={`p-2 rounded-lg border transition-all ${
                    currentTool === 'circle'
                      ? 'bg-accent-1 border-accent-1 text-white'
                      : 'glass-effect border-grid-blue/30 text-muted-white hover:border-accent-1/50'
                  }`}
                  title="Circle"
                >
                  <Circle className="w-4 h-4" />
                </button>

                <div className="h-6 w-px bg-grid-blue/30 mx-2"></div>

                <input
                  type="color"
                  value={currentColor}
                  onChange={(e) => setCurrentColor(e.target.value)}
                  className="w-8 h-8 rounded-lg cursor-pointer"
                  title="Color"
                />

                <div className="h-6 w-px bg-grid-blue/30 mx-2"></div>

                <button
                  onClick={() => addComponent('server', 'Server')}
                  className="px-3 py-2 rounded-lg text-xs glass-effect border border-grid-blue/30 text-muted-white hover:border-accent-1/50 transition-all"
                >
                  + Server
                </button>
                <button
                  onClick={() => addComponent('database', 'Database')}
                  className="px-3 py-2 rounded-lg text-xs glass-effect border border-grid-blue/30 text-muted-white hover:border-accent-1/50 transition-all"
                >
                  + Database
                </button>
                <button
                  onClick={() => addComponent('cache', 'Cache')}
                  className="px-3 py-2 rounded-lg text-xs glass-effect border border-grid-blue/30 text-muted-white hover:border-accent-1/50 transition-all"
                >
                  + Cache
                </button>
                <button
                  onClick={() => addComponent('rectangle', 'Load Balancer')}
                  className="px-3 py-2 rounded-lg text-xs glass-effect border border-grid-blue/30 text-muted-white hover:border-accent-1/50 transition-all"
                >
                  + LB
                </button>
              </div>

              <canvas
                ref={canvasRef}
                width={1000}
                height={600}
                className="w-full rounded-xl border border-grid-blue/30 cursor-crosshair"
                onMouseDown={handleCanvasMouseDown}
                onMouseMove={handleCanvasMouseMove}
                onMouseUp={handleCanvasMouseUp}
                onMouseLeave={handleCanvasMouseUp}
              />

              <div className="mt-4 text-xs text-muted-white/60">
                <p>Components: {components.length} | Drawing elements: {drawingElements.length}</p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="glass-effect rounded-2xl p-6 border border-grid-blue/20 shadow-card-shadow">
              <h3 className="text-lg font-semibold text-muted-white mb-3">Problem Statement</h3>
              <p className="text-muted-white/80 text-sm leading-relaxed mb-4">
                {problem?.description}
              </p>

              {problem?.requirements && (
                <div className="mb-4">
                  <h4 className="text-sm font-semibold text-muted-white mb-2">Requirements:</h4>
                  <ul className="space-y-1">
                    {problem.requirements.map((req, idx) => (
                      <li key={idx} className="text-xs text-muted-white/70 flex items-start gap-2">
                        <CheckCircle2 className="w-3 h-3 text-neon-green mt-0.5 flex-shrink-0" />
                        {req}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {problem?.scale_requirements && (
                <div className="p-3 rounded-xl bg-bg-darker/50 border border-grid-blue/20">
                  <h4 className="text-sm font-semibold text-muted-white mb-2">Scale:</h4>
                  <div className="space-y-1">
                    {Object.entries(problem.scale_requirements).map(([key, value]) => (
                      <div key={key} className="text-xs text-muted-white/70">
                        <span className="text-cyan-glow">{key.replace(/_/g, ' ')}:</span> {value}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="glass-effect rounded-2xl p-6 border border-grid-blue/20 shadow-card-shadow">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-muted-white flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-cyan-glow" />
                  AI Interviewer
                </h3>
              </div>

              <div className="h-80 overflow-y-auto mb-4 space-y-3 p-4 rounded-xl bg-bg-darker/50 border border-grid-blue/20">
                {messages.map((msg, idx) => (
                  <div key={idx} className={`flex gap-3 ${msg.role === 'candidate' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`flex gap-3 max-w-[85%] ${msg.role === 'candidate' ? 'flex-row-reverse' : 'flex-row'}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                        msg.role === 'candidate' ? 'bg-accent-1' : 'bg-neon-green/20 border border-neon-green/30'
                      }`}>
                        {msg.role === 'candidate' ? (
                          <User className="w-4 h-4 text-white" />
                        ) : (
                          <Bot className="w-4 h-4 text-neon-green" />
                        )}
                      </div>
                      <div className={`rounded-xl p-3 ${
                        msg.role === 'candidate'
                          ? 'bg-accent-1 text-white'
                          : 'bg-bg-darker/70 border border-grid-blue/30 text-muted-white'
                      }`}>
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                        <span className="text-xs opacity-60 mt-1 block">
                          {msg.timestamp?.toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
                {sendingMessage && (
                  <div className="flex gap-3 justify-start">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-neon-green/20 border border-neon-green/30">
                      <Bot className="w-4 h-4 text-neon-green" />
                    </div>
                    <div className="bg-bg-darker/70 border border-grid-blue/30 rounded-xl p-3">
                      <Loader2 className="w-4 h-4 text-cyan-glow animate-spin" />
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              <form onSubmit={sendMessage} className="flex gap-2">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Discuss your design approach..."
                  className="flex-1 px-4 py-3 rounded-xl bg-bg-darker/50 border border-grid-blue/30 text-muted-white placeholder-muted-white/40 focus:outline-none focus:border-accent-1 focus:ring-2 focus:ring-accent-1/20 transition-all text-sm"
                  disabled={sendingMessage}
                />
                <button
                  type="submit"
                  disabled={!inputMessage.trim() || sendingMessage}
                  className="px-6 py-3 rounded-xl bg-gradient-to-b from-accent-1 to-accent-2 text-white font-semibold shadow-btn-primary hover:shadow-btn-primary-hover transition-all hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 flex items-center gap-2"
                >
                  <Send className="w-5 h-5" />
                </button>
              </form>
            </div>
          </div>
        </div>

        <div className="mt-8 flex justify-end">
          <button
            onClick={completeRound}
            disabled={loading}
            className="px-8 py-4 rounded-xl bg-gradient-to-b from-neon-green to-cyan-glow text-white font-semibold shadow-btn-primary hover:shadow-btn-primary-hover transition-all hover:-translate-y-1 disabled:opacity-50 flex items-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Completing...
              </>
            ) : (
              <>
                <CheckCircle2 className="w-5 h-5" />
                Complete System Design Round
              </>
            )}
          </button>
        </div>
      </div>
    </section>
  );
}

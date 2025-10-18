import { useState, useEffect, useRef } from 'react';
import { Upload, FileText, Loader2, CheckCircle2, AlertCircle, X } from 'lucide-react';

export default function ResumeUpload({ jobProfile, onScreeningComplete }) {
  const [file, setFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    setTimeout(() => setIsVisible(true), 100);
  }, []);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (selectedFile) => {
    if (selectedFile.type !== 'application/pdf') {
      setError('Please upload a PDF file');
      return;
    }
    if (selectedFile.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB');
      return;
    }
    setError('');
    setFile(selectedFile);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return;

    setLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('resume_file', file);

      const response = await fetch(`http://localhost:8000/resumes/screen/${jobProfile.job_id}`, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to screen resume');
      }

      const screeningResult = await response.json();
      onScreeningComplete(screeningResult);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const removeFile = () => {
    setFile(null);
    setError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <section id="resume-upload" className="relative min-h-screen py-20 px-4 sm:px-6 lg:px-8">
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-1/3 left-1/4 w-80 h-80 bg-cyan-glow/30 rounded-full blur-3xl"></div>
      </div>

      <div
        className={`relative z-10 max-w-4xl mx-auto transition-all duration-1000 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}
      >
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-effect border border-cyan-glow/30 mb-6">
            <FileText className="w-4 h-4 text-neon-green" />
            <span className="text-sm text-muted-white/90">Step 2: Resume Screening</span>
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold text-muted-white text-shadow-hero mb-4">
            Upload Your Resume
          </h2>
          <p className="text-muted-white/70 text-lg">
            We'll analyze your resume against the job requirements
          </p>
        </div>

        <div className="glass-effect rounded-2xl p-8 border border-grid-blue/20 shadow-card-shadow mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="p-4 rounded-xl bg-bg-darker/30 border border-grid-blue/20">
              <div className="text-sm text-muted-white/60 mb-1">Job Title</div>
              <div className="text-muted-white font-semibold">{jobProfile.job_title}</div>
            </div>
            <div className="p-4 rounded-xl bg-bg-darker/30 border border-grid-blue/20">
              <div className="text-sm text-muted-white/60 mb-1">Company</div>
              <div className="text-muted-white font-semibold">{jobProfile.company}</div>
            </div>
            <div className="p-4 rounded-xl bg-bg-darker/30 border border-grid-blue/20">
              <div className="text-sm text-muted-white/60 mb-1">Required Experience</div>
              <div className="text-muted-white font-semibold">{jobProfile.required_experience_years}+ years</div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-accent-1/5 border border-accent-1/20">
            <div className="text-sm font-semibold text-muted-white mb-2">Required Skills:</div>
            <div className="flex flex-wrap gap-2">
              {jobProfile.required_skills.map((skill, index) => (
                <span
                  key={index}
                  className="px-3 py-1 rounded-lg bg-accent-1/20 text-cyan-glow text-sm border border-accent-1/30"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="glass-effect rounded-2xl p-8 border border-grid-blue/20 shadow-card-shadow">
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`relative border-2 border-dashed rounded-2xl p-12 text-center transition-all ${
              dragActive
                ? 'border-accent-1 bg-accent-1/5'
                : 'border-grid-blue/30 hover:border-accent-1/50'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              onChange={handleChange}
              className="hidden"
              id="resume-upload-input"
            />

            {!file ? (
              <>
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-accent-1/10 flex items-center justify-center">
                  <Upload className="w-8 h-8 text-accent-1" />
                </div>
                <h3 className="text-xl font-semibold text-muted-white mb-2">
                  Drop your resume here
                </h3>
                <p className="text-muted-white/60 mb-6">or click to browse</p>
                <label
                  htmlFor="resume-upload-input"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-b from-accent-1 to-accent-2 text-white font-semibold cursor-pointer hover:shadow-btn-primary-hover transition-all hover:-translate-y-1"
                >
                  Select PDF File
                </label>
                <p className="text-muted-white/40 text-sm mt-4">Maximum file size: 10MB</p>
              </>
            ) : (
              <div className="flex items-center justify-between p-4 rounded-xl bg-bg-darker/50 border border-accent-1/30">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-accent-1/10 flex items-center justify-center">
                    <FileText className="w-6 h-6 text-accent-1" />
                  </div>
                  <div className="text-left">
                    <div className="text-muted-white font-semibold">{file.name}</div>
                    <div className="text-muted-white/60 text-sm">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={removeFile}
                  className="p-2 rounded-lg hover:bg-red-500/10 text-muted-white/60 hover:text-red-400 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>

          {error && (
            <div className="mt-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={!file || loading}
            className="w-full mt-6 px-6 py-4 rounded-xl bg-gradient-to-b from-accent-1 to-accent-2 text-white font-semibold shadow-btn-primary hover:shadow-btn-primary-hover transition-all hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Screening Resume...
              </>
            ) : (
              <>
                <CheckCircle2 className="w-5 h-5" />
                Screen Resume
              </>
            )}
          </button>
        </form>
      </div>
    </section>
  );
}

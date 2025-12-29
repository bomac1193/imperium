import { useState } from 'react';
import { useAccount } from 'wagmi';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload,
  Music,
  Users,
  Plus,
  Trash2,
  Check,
  Loader2,
  AlertCircle,
  Wallet,
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import { useRegisterSong, useConfigureSplits } from '@/hooks/useContracts';
import { keccak256, toBytes } from 'viem';

interface Collaborator {
  address: string;
  percentage: number;
  role: string;
}

export default function UploadPage() {
  const { address, isConnected } = useAccount();
  const { registerSong, isPending, isConfirming, isSuccess, hash, error } = useRegisterSong();
  const { configureSplits } = useConfigureSplits();

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    title: '',
    isrc: '',
    metadataURI: '',
    audioFile: null as File | null,
  });

  const [collaborators, setCollaborators] = useState<Collaborator[]>([
    { address: address || '', percentage: 100, role: 'artist' },
  ]);

  const [uploadProgress, setUploadProgress] = useState(0);

  const totalPercentage = collaborators.reduce((sum, c) => sum + c.percentage, 0);

  const addCollaborator = () => {
    if (collaborators.length < 10) {
      setCollaborators([...collaborators, { address: '', percentage: 0, role: 'producer' }]);
    }
  };

  const removeCollaborator = (index: number) => {
    if (collaborators.length > 1) {
      setCollaborators(collaborators.filter((_, i) => i !== index));
    }
  };

  const updateCollaborator = (index: number, field: keyof Collaborator, value: string | number) => {
    const updated = [...collaborators];
    updated[index] = { ...updated[index], [field]: value };
    setCollaborators(updated);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData({ ...formData, audioFile: file });
      // Simulate upload progress
      let progress = 0;
      const interval = setInterval(() => {
        progress += 10;
        setUploadProgress(progress);
        if (progress >= 100) clearInterval(interval);
      }, 200);
    }
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.isrc) return;

    const contentHash = formData.audioFile
      ? keccak256(toBytes(formData.audioFile.name + Date.now()))
      : '0x0000000000000000000000000000000000000000000000000000000000000000' as `0x${string}`;

    const metadataURI = formData.metadataURI || `ipfs://placeholder-${Date.now()}`;

    await registerSong(
      formData.isrc,
      formData.title,
      metadataURI,
      contentHash
    );
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-imperium-dark">
        <Navbar />
        <div className="pt-32 container mx-auto px-6">
          <div className="max-w-md mx-auto text-center">
            <Wallet className="w-16 h-16 mx-auto text-imperium-gold/50 mb-6" />
            <h1 className="text-2xl font-bold mb-4">Connect Your Wallet</h1>
            <p className="text-white/60 mb-8">
              Connect your wallet to register songs on the Imperium platform.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-imperium-dark">
      <Navbar />

      <main className="pt-24 pb-12 container mx-auto px-6">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-display font-bold mb-4">
              Register Your <span className="text-imperium-gold">Song</span>
            </h1>
            <p className="text-white/60">
              Add your music to the blockchain. Transparent ownership. Instant royalties.
            </p>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-center gap-4 mb-12">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center gap-4">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${
                    step >= s
                      ? 'bg-imperium-gold text-imperium-dark'
                      : 'bg-white/10 text-white/40'
                  }`}
                >
                  {step > s ? <Check className="w-5 h-5" /> : s}
                </div>
                {s < 3 && (
                  <div
                    className={`w-20 h-0.5 ${
                      step > s ? 'bg-imperium-gold' : 'bg-white/10'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Step Content */}
          <div className="glass rounded-xl p-8">
            <AnimatePresence mode="wait">
              {/* Step 1: Song Details */}
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                    <Music className="w-6 h-6 text-imperium-gold" />
                    Song Details
                  </h2>

                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm text-white/60 mb-2">Song Title *</label>
                      <input
                        type="text"
                        className="input-imperium"
                        placeholder="Enter song title"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      />
                    </div>

                    <div>
                      <label className="block text-sm text-white/60 mb-2">ISRC Code *</label>
                      <input
                        type="text"
                        className="input-imperium"
                        placeholder="e.g., USRC12345678"
                        value={formData.isrc}
                        onChange={(e) => setFormData({ ...formData, isrc: e.target.value.toUpperCase() })}
                        maxLength={12}
                      />
                      <p className="text-xs text-white/40 mt-1">
                        International Standard Recording Code (12 characters)
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm text-white/60 mb-2">Metadata URI (IPFS/Arweave)</label>
                      <input
                        type="text"
                        className="input-imperium"
                        placeholder="ipfs://... or ar://..."
                        value={formData.metadataURI}
                        onChange={(e) => setFormData({ ...formData, metadataURI: e.target.value })}
                      />
                    </div>

                    <div>
                      <label className="block text-sm text-white/60 mb-2">Audio File (for verification)</label>
                      <div className="border-2 border-dashed border-white/20 rounded-lg p-8 text-center hover:border-imperium-gold/50 transition-all">
                        {formData.audioFile ? (
                          <div>
                            <Check className="w-8 h-8 mx-auto text-green-400 mb-2" />
                            <p className="font-medium">{formData.audioFile.name}</p>
                            <p className="text-sm text-white/40">
                              {(formData.audioFile.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                            {uploadProgress < 100 && (
                              <div className="mt-4 w-full bg-white/10 rounded-full h-2">
                                <div
                                  className="bg-imperium-gold h-2 rounded-full transition-all"
                                  style={{ width: `${uploadProgress}%` }}
                                />
                              </div>
                            )}
                          </div>
                        ) : (
                          <label className="cursor-pointer">
                            <Upload className="w-8 h-8 mx-auto text-white/40 mb-2" />
                            <p className="text-white/60">Drop audio file or click to upload</p>
                            <p className="text-xs text-white/40 mt-1">MP3, WAV, FLAC (max 50MB)</p>
                            <input
                              type="file"
                              className="hidden"
                              accept=".mp3,.wav,.flac"
                              onChange={handleFileUpload}
                            />
                          </label>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end mt-8">
                    <button
                      onClick={() => setStep(2)}
                      disabled={!formData.title || !formData.isrc}
                      className="px-6 py-3 bg-imperium-gold text-imperium-dark font-bold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-imperium-gold/90 transition-all"
                    >
                      Continue
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Step 2: Royalty Splits */}
              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                    <Users className="w-6 h-6 text-imperium-gold" />
                    Royalty Splits
                  </h2>

                  <div className="space-y-4 mb-6">
                    {collaborators.map((collab, index) => (
                      <div key={index} className="flex gap-4 items-start">
                        <div className="flex-1">
                          <input
                            type="text"
                            className="input-imperium"
                            placeholder="Wallet address (0x...)"
                            value={collab.address}
                            onChange={(e) => updateCollaborator(index, 'address', e.target.value)}
                          />
                        </div>
                        <div className="w-24">
                          <input
                            type="number"
                            className="input-imperium text-center"
                            placeholder="%"
                            min="0"
                            max="100"
                            value={collab.percentage || ''}
                            onChange={(e) =>
                              updateCollaborator(index, 'percentage', parseInt(e.target.value) || 0)
                            }
                          />
                        </div>
                        <div className="w-32">
                          <select
                            className="input-imperium"
                            value={collab.role}
                            onChange={(e) => updateCollaborator(index, 'role', e.target.value)}
                          >
                            <option value="artist">Artist</option>
                            <option value="producer">Producer</option>
                            <option value="writer">Writer</option>
                            <option value="label">Label</option>
                            <option value="other">Other</option>
                          </select>
                        </div>
                        <button
                          onClick={() => removeCollaborator(index)}
                          className="p-3 text-red-400 hover:bg-red-400/10 rounded-lg transition-all"
                          disabled={collaborators.length === 1}
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={addCollaborator}
                    className="flex items-center gap-2 text-imperium-gold hover:text-imperium-gold/80 mb-6"
                  >
                    <Plus className="w-5 h-5" />
                    Add Collaborator
                  </button>

                  {/* Total Indicator */}
                  <div
                    className={`p-4 rounded-lg ${
                      totalPercentage === 100
                        ? 'bg-green-500/10 border border-green-500/30'
                        : 'bg-red-500/10 border border-red-500/30'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span>Total Split:</span>
                      <span className={`font-bold ${totalPercentage === 100 ? 'text-green-400' : 'text-red-400'}`}>
                        {totalPercentage}%
                      </span>
                    </div>
                    {totalPercentage !== 100 && (
                      <p className="text-sm mt-2 text-red-400">
                        Total must equal 100%
                      </p>
                    )}
                  </div>

                  <div className="flex justify-between mt-8">
                    <button
                      onClick={() => setStep(1)}
                      className="px-6 py-3 border border-white/20 rounded-lg hover:bg-white/5 transition-all"
                    >
                      Back
                    </button>
                    <button
                      onClick={() => setStep(3)}
                      disabled={totalPercentage !== 100}
                      className="px-6 py-3 bg-imperium-gold text-imperium-dark font-bold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-imperium-gold/90 transition-all"
                    >
                      Continue
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Step 3: Review & Submit */}
              {step === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                    <Check className="w-6 h-6 text-imperium-gold" />
                    Review & Register
                  </h2>

                  <div className="space-y-6">
                    {/* Song Summary */}
                    <div className="bg-white/5 rounded-lg p-6">
                      <h3 className="font-bold mb-4">Song Details</h3>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-white/60">Title:</span>
                          <span className="ml-2">{formData.title}</span>
                        </div>
                        <div>
                          <span className="text-white/60">ISRC:</span>
                          <span className="ml-2 font-mono">{formData.isrc}</span>
                        </div>
                      </div>
                    </div>

                    {/* Splits Summary */}
                    <div className="bg-white/5 rounded-lg p-6">
                      <h3 className="font-bold mb-4">Royalty Splits</h3>
                      <div className="space-y-2">
                        {collaborators.map((collab, index) => (
                          <div key={index} className="flex justify-between text-sm">
                            <span className="text-white/60">
                              {collab.address.slice(0, 8)}...{collab.address.slice(-6)} ({collab.role})
                            </span>
                            <span className="font-mono text-imperium-gold">{collab.percentage}%</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Warning */}
                    <div className="flex items-start gap-3 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                      <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                      <div className="text-sm">
                        <p className="font-medium text-yellow-400">Important</p>
                        <p className="text-white/60">
                          This action will register your song on the blockchain.
                          Song metadata and splits can be updated later, but the ISRC registration is permanent.
                        </p>
                      </div>
                    </div>

                    {/* Transaction Status */}
                    {(isPending || isConfirming || isSuccess || error) && (
                      <div
                        className={`p-4 rounded-lg ${
                          isSuccess
                            ? 'bg-green-500/10 border border-green-500/30'
                            : error
                            ? 'bg-red-500/10 border border-red-500/30'
                            : 'bg-blue-500/10 border border-blue-500/30'
                        }`}
                      >
                        {isPending && (
                          <div className="flex items-center gap-3">
                            <Loader2 className="w-5 h-5 animate-spin text-blue-400" />
                            <span>Waiting for wallet confirmation...</span>
                          </div>
                        )}
                        {isConfirming && (
                          <div className="flex items-center gap-3">
                            <Loader2 className="w-5 h-5 animate-spin text-blue-400" />
                            <span>Transaction pending...</span>
                          </div>
                        )}
                        {isSuccess && (
                          <div className="flex items-center gap-3">
                            <Check className="w-5 h-5 text-green-400" />
                            <div>
                              <p className="font-medium text-green-400">Song Registered!</p>
                              <a
                                href={`https://polygonscan.com/tx/${hash}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-white/60 hover:text-white"
                              >
                                View transaction
                              </a>
                            </div>
                          </div>
                        )}
                        {error && (
                          <div className="flex items-center gap-3">
                            <AlertCircle className="w-5 h-5 text-red-400" />
                            <span className="text-red-400">Transaction failed. Please try again.</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex justify-between mt-8">
                    <button
                      onClick={() => setStep(2)}
                      className="px-6 py-3 border border-white/20 rounded-lg hover:bg-white/5 transition-all"
                      disabled={isPending || isConfirming}
                    >
                      Back
                    </button>
                    <button
                      onClick={handleSubmit}
                      disabled={isPending || isConfirming || isSuccess}
                      className="px-6 py-3 bg-imperium-gold text-imperium-dark font-bold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-imperium-gold/90 transition-all flex items-center gap-2"
                    >
                      {(isPending || isConfirming) && <Loader2 className="w-5 h-5 animate-spin" />}
                      {isSuccess ? 'Registered!' : 'Register Song'}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>
    </div>
  );
}

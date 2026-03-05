import { useState, useCallback } from 'react';
import { useAccount } from 'wagmi';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Trash2,
  Check,
  Loader2,
  AlertCircle,
  Link as LinkIcon,
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent } from '@/components/ui/Card';
import { useRegisterSong, useConfigureSplits } from '@/hooks/useContracts';
import { keccak256, toBytes } from 'viem';
import { cn } from '@/lib/utils';

// ── o8 Declaration Types ──────────────────────────────────────────────────────

interface O8ContributorSplit {
  name: string;
  role: string;
  wallet: string;
  split: number;
}

interface O8Declaration {
  id: string;
  title: string;
  artistName: string;
  artistWallet: string | null;
  aiComposition: number;
  aiArrangement: number;
  aiProduction: number;
  aiMixing: number;
  aiMastering: number;
  transparencyScore: number;
  badge: string;
  methodology: string | null;
  daws: string | null;
  plugins: string | null;
  aiModels: string | null;
  ipfsCID: string;
  sha256: string;
  trainingRights: boolean;
  derivativeRights: boolean;
  remixRights: boolean;
  contributorSplits: O8ContributorSplit[];
  createdAt: string;
}

// ── Form Types ────────────────────────────────────────────────────────────────

interface Collaborator {
  address: string;
  percentage: number;
  role: string;
}

// ── o8 API ────────────────────────────────────────────────────────────────────

const O8_API_URL = process.env.NEXT_PUBLIC_O8_API_URL || 'http://localhost:3000/api';

async function fetchO8Declaration(declarationId: string): Promise<O8Declaration> {
  const res = await fetch(`${O8_API_URL}/declarations/${declarationId}`);
  if (!res.ok) throw new Error('Declaration not found');
  return res.json();
}

// ── Page ──────────────────────────────────────────────────────────────────────

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

  // o8 integration state
  const [o8Id, setO8Id] = useState('');
  const [o8Declaration, setO8Declaration] = useState<O8Declaration | null>(null);
  const [o8Loading, setO8Loading] = useState(false);
  const [o8Error, setO8Error] = useState('');

  const [collaborators, setCollaborators] = useState<Collaborator[]>([
    { address: address || '', percentage: 100, role: 'artist' },
  ]);

  const [uploadProgress, setUploadProgress] = useState(0);

  const totalPercentage = collaborators.reduce((sum, c) => sum + c.percentage, 0);

  // ── o8 Import ─────────────────────────────────────────────────────────────

  const importO8Declaration = useCallback(async () => {
    if (!o8Id.trim()) return;

    setO8Loading(true);
    setO8Error('');

    try {
      const declaration = await fetchO8Declaration(o8Id.trim());
      setO8Declaration(declaration);

      // Auto-fill song details
      setFormData((prev) => ({
        ...prev,
        title: declaration.title || prev.title,
        metadataURI: declaration.ipfsCID ? `ipfs://${declaration.ipfsCID}` : prev.metadataURI,
      }));

      // Auto-fill splits from declaration
      if (declaration.contributorSplits && declaration.contributorSplits.length > 0) {
        setCollaborators(
          declaration.contributorSplits.map((s) => ({
            address: s.wallet || '',
            percentage: s.split,
            role: s.role.toLowerCase().replace(/\s+/g, '_'),
          }))
        );
      } else if (declaration.artistWallet) {
        setCollaborators([
          { address: declaration.artistWallet, percentage: 100, role: 'artist' },
        ]);
      }
    } catch {
      setO8Error('Could not fetch declaration. Check the ID and try again.');
    } finally {
      setO8Loading(false);
    }
  }, [o8Id]);

  const clearO8 = () => {
    setO8Declaration(null);
    setO8Id('');
    setO8Error('');
  };

  // ── Collaborator Management ───────────────────────────────────────────────

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

    // Use o8 IPFS CID as metadata URI if available
    const metadataURI = o8Declaration?.ipfsCID
      ? `ipfs://${o8Declaration.ipfsCID}`
      : formData.metadataURI || `ipfs://placeholder-${Date.now()}`;

    await registerSong(
      formData.isrc,
      formData.title,
      metadataURI,
      contentHash
    );
  };

  // ── AI transparency helper ────────────────────────────────────────────────

  const avgAi = o8Declaration
    ? Math.round(
        (o8Declaration.aiComposition +
          o8Declaration.aiArrangement +
          o8Declaration.aiProduction +
          o8Declaration.aiMixing +
          o8Declaration.aiMastering) / 5
      )
    : 0;

  // ── Render ────────────────────────────────────────────────────────────────

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-black md:pl-48">
        <Navbar />
        <div className="pt-24 md:pt-16 container mx-auto px-6">
          <div className="max-w-sm mx-auto text-center">
            <h1 className="font-display text-heading-lg mb-4">Connect your wallet</h1>
            <p className="text-gray-400 font-light text-body-sm">
              Connect to register songs on-chain.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black md:pl-48">
      <Navbar />

      <main className="pt-20 md:pt-8 pb-12 container mx-auto px-6">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <p className="overline mb-4">Registration</p>
            <h1 className="font-display text-display-sm mb-4">
              Register your song
            </h1>
            <p className="text-gray-400 font-light">
              Transparent ownership. Instant royalties. On-chain forever.
            </p>
          </div>

          {/* Step Indicators */}
          <div className="flex items-center justify-center gap-4 mb-12">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center gap-4">
                <div
                  className={cn(
                    'w-10 h-10 flex items-center justify-center font-mono text-body-sm transition-all',
                    step >= s
                      ? 'bg-accent text-black'
                      : 'bg-[#0a0a0a] border border-[#1a1a1a] text-gray-500'
                  )}
                >
                  {step > s ? <Check className="w-5 h-5" /> : s}
                </div>
                {s < 3 && (
                  <div
                    className={cn(
                      'w-20 h-px',
                      step > s ? 'bg-accent' : 'bg-[#1a1a1a]'
                    )}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Step Content */}
          <Card>
            <CardContent className="p-8">
              <AnimatePresence mode="wait">
                {/* Step 1: Song Details */}
                {step === 1 && (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                  >
                    <h2 className="font-display text-heading-md mb-6">
                      Song details
                    </h2>

                    {/* o8 Declaration Import */}
                    <div className="mb-8 p-6 border border-[#1a1a1a] bg-[#050505]">
                      <div className="flex items-center gap-2 mb-3">
                        <LinkIcon className="w-4 h-4 text-gray-500" />
                        <span className="overline">Import from o8</span>
                      </div>

                      {o8Declaration ? (
                        <div>
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <Check className="w-4 h-4 text-success" />
                              <span className="text-body-sm text-success">Declaration linked</span>
                            </div>
                            <button
                              onClick={clearO8}
                              className="text-body-sm text-gray-500 hover:text-white transition-colors"
                            >
                              Remove
                            </button>
                          </div>
                          <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-body-sm">
                            <div>
                              <span className="text-gray-500">Title</span>
                              <p>{o8Declaration.title || 'Untitled'}</p>
                            </div>
                            <div>
                              <span className="text-gray-500">Artist</span>
                              <p>{o8Declaration.artistName}</p>
                            </div>
                            <div>
                              <span className="text-gray-500">Transparency</span>
                              <p className="font-mono">{o8Declaration.transparencyScore}/100</p>
                            </div>
                            <div>
                              <span className="text-gray-500">AI contribution</span>
                              <p className="font-mono">{avgAi}% avg</p>
                            </div>
                            {o8Declaration.badge && (
                              <div className="col-span-2">
                                <span className="text-gray-500">Badges</span>
                                <div className="flex gap-2 mt-1">
                                  {o8Declaration.badge.split(',').map((b) => (
                                    <span
                                      key={b}
                                      className="text-caption px-2 py-0.5 border border-[#1a1a1a] text-gray-400"
                                    >
                                      {b.trim().replace(/_/g, ' ')}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                            {o8Declaration.contributorSplits.length > 0 && (
                              <div className="col-span-2">
                                <span className="text-gray-500">
                                  Splits ({o8Declaration.contributorSplits.length} recipients)
                                </span>
                                <p className="text-gray-300">
                                  Auto-filled in Step 2
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div>
                          <p className="text-body-sm text-gray-500 mb-3">
                            Paste your o8 declaration ID to auto-fill provenance, splits, and metadata.
                          </p>
                          <div className="flex gap-3">
                            <div className="flex-1">
                              <input
                                className="w-full bg-transparent border-b border-[#1a1a1a] py-2 text-white font-mono text-body-sm outline-none transition-colors focus:border-accent placeholder:text-gray-600"
                                placeholder="Declaration ID (e.g., cm5x8k2...)"
                                value={o8Id}
                                onChange={(e) => setO8Id(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && importO8Declaration()}
                              />
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={importO8Declaration}
                              disabled={o8Loading || !o8Id.trim()}
                            >
                              {o8Loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Import'}
                            </Button>
                          </div>
                          {o8Error && (
                            <p className="text-caption text-error mt-2">{o8Error}</p>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="space-y-6">
                      <Input
                        label="Song Title"
                        placeholder="Enter song title"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      />

                      <div>
                        <Input
                          label="ISRC Code"
                          placeholder="e.g., USRC12345678"
                          value={formData.isrc}
                          onChange={(e) => setFormData({ ...formData, isrc: e.target.value.toUpperCase() })}
                          maxLength={12}
                        />
                        <p className="text-caption text-gray-600 mt-1">
                          International Standard Recording Code (12 characters)
                        </p>
                      </div>

                      {!o8Declaration && (
                        <Input
                          label="Metadata URI (IPFS/Arweave)"
                          placeholder="ipfs://... or ar://..."
                          value={formData.metadataURI}
                          onChange={(e) => setFormData({ ...formData, metadataURI: e.target.value })}
                        />
                      )}

                      <div>
                        <label className="overline block mb-2">Audio File (for verification)</label>
                        <div className="border border-dashed border-[#1a1a1a] p-8 text-center hover:border-accent/50 transition-all">
                          {formData.audioFile ? (
                            <div>
                              <Check className="w-8 h-8 mx-auto text-success mb-2" />
                              <p className="font-medium">{formData.audioFile.name}</p>
                              <p className="text-body-sm text-gray-500">
                                {(formData.audioFile.size / 1024 / 1024).toFixed(2)} MB
                              </p>
                              {uploadProgress < 100 && (
                                <div className="mt-4 w-full bg-[#1a1a1a] h-1">
                                  <div
                                    className="bg-accent h-1 transition-all"
                                    style={{ width: `${uploadProgress}%` }}
                                  />
                                </div>
                              )}
                            </div>
                          ) : (
                            <label className="cursor-pointer">
                              <p className="text-gray-400">Drop audio file or click to browse</p>
                              <p className="text-caption text-gray-600 mt-1">MP3, WAV, FLAC (max 50MB)</p>
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
                      <Button
                        variant="accent"
                        onClick={() => setStep(2)}
                        disabled={!formData.title || !formData.isrc}
                      >
                        Continue
                      </Button>
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
                    <h2 className="font-display text-heading-md mb-2">
                      Royalty splits
                    </h2>

                    {o8Declaration && o8Declaration.contributorSplits.length > 0 && (
                      <p className="text-body-sm text-gray-500 mb-6">
                        Pre-filled from o8 declaration. Edit below if needed.
                      </p>
                    )}

                    <div className="space-y-4 mb-6 mt-6">
                      {collaborators.map((collab, index) => (
                        <div key={index} className="flex gap-4 items-start">
                          <div className="flex-1">
                            <Input
                              variant="boxed"
                              placeholder="Wallet address (0x...)"
                              value={collab.address}
                              onChange={(e) => updateCollaborator(index, 'address', e.target.value)}
                            />
                          </div>
                          <div className="w-24">
                            <Input
                              variant="boxed"
                              className="text-center font-mono"
                              placeholder="%"
                              type="number"
                              min={0}
                              max={100}
                              value={collab.percentage || ''}
                              onChange={(e) =>
                                updateCollaborator(index, 'percentage', parseInt(e.target.value) || 0)
                              }
                            />
                          </div>
                          <div className="w-32">
                            <select
                              className="w-full bg-[#0a0a0a] border border-[#1a1a1a] px-4 py-3 text-white font-sans font-light outline-none transition-colors focus:border-accent"
                              value={collab.role}
                              onChange={(e) => updateCollaborator(index, 'role', e.target.value)}
                            >
                              <option value="artist">Artist</option>
                              <option value="producer">Producer</option>
                              <option value="writer">Writer</option>
                              <option value="engineer">Engineer</option>
                              <option value="vocalist">Vocalist</option>
                              <option value="label">Label</option>
                              <option value="other">Other</option>
                            </select>
                          </div>
                          <button
                            onClick={() => removeCollaborator(index)}
                            className="p-3 text-error hover:bg-error/10 transition-all"
                            disabled={collaborators.length === 1}
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      ))}
                    </div>

                    <button
                      onClick={addCollaborator}
                      className="flex items-center gap-2 text-accent hover:opacity-80 mb-6"
                    >
                      <Plus className="w-5 h-5" />
                      Add collaborator
                    </button>

                    <div
                      className={cn(
                        'p-4 border',
                        totalPercentage === 100
                          ? 'border-success/30 bg-success/5'
                          : 'border-error/30 bg-error/5'
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <span>Total Split:</span>
                        <span className={cn('font-mono font-medium', totalPercentage === 100 ? 'text-success' : 'text-error')}>
                          {totalPercentage}%
                        </span>
                      </div>
                      {totalPercentage !== 100 && (
                        <p className="text-body-sm mt-2 text-error">
                          Total must equal 100%
                        </p>
                      )}
                    </div>

                    <div className="flex justify-between mt-8">
                      <Button variant="outline" onClick={() => setStep(1)}>
                        Back
                      </Button>
                      <Button
                        variant="accent"
                        onClick={() => setStep(3)}
                        disabled={totalPercentage !== 100}
                      >
                        Continue
                      </Button>
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
                    <h2 className="font-display text-heading-md mb-6">
                      Review & register
                    </h2>

                    <div className="space-y-6">
                      {/* o8 Provenance */}
                      {o8Declaration && (
                        <div className="bg-[#0a0a0a] border border-[#1a1a1a] p-6">
                          <p className="overline mb-3">Provenance (o8)</p>
                          <div className="grid grid-cols-2 gap-4 text-body-sm">
                            <div>
                              <span className="text-gray-400">Declaration</span>
                              <span className="ml-2 font-mono text-gray-300">{o8Declaration.id.slice(0, 12)}...</span>
                            </div>
                            <div>
                              <span className="text-gray-400">Transparency</span>
                              <span className="ml-2 font-mono">{o8Declaration.transparencyScore}/100</span>
                            </div>
                            <div>
                              <span className="text-gray-400">AI avg</span>
                              <span className="ml-2 font-mono">{avgAi}%</span>
                            </div>
                            <div>
                              <span className="text-gray-400">IPFS</span>
                              <span className="ml-2 font-mono text-gray-300">
                                {o8Declaration.ipfsCID ? `${o8Declaration.ipfsCID.slice(0, 12)}...` : 'None'}
                              </span>
                            </div>
                            {o8Declaration.sha256 && (
                              <div className="col-span-2">
                                <span className="text-gray-400">Audio fingerprint</span>
                                <span className="ml-2 font-mono text-gray-300">
                                  {o8Declaration.sha256.slice(0, 16)}...
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Song Details */}
                      <div className="bg-[#0a0a0a] border border-[#1a1a1a] p-6">
                        <p className="overline mb-3">Song details</p>
                        <div className="grid grid-cols-2 gap-4 text-body-sm">
                          <div>
                            <span className="text-gray-400">Title</span>
                            <span className="ml-2">{formData.title}</span>
                          </div>
                          <div>
                            <span className="text-gray-400">ISRC</span>
                            <span className="ml-2 font-mono">{formData.isrc}</span>
                          </div>
                        </div>
                      </div>

                      {/* Royalty Splits */}
                      <div className="bg-[#0a0a0a] border border-[#1a1a1a] p-6">
                        <p className="overline mb-3">Royalty splits</p>
                        <div className="space-y-2">
                          {collaborators.map((collab, index) => (
                            <div key={index} className="flex justify-between text-body-sm">
                              <span className="text-gray-400">
                                {collab.address
                                  ? `${collab.address.slice(0, 8)}...${collab.address.slice(-6)}`
                                  : 'No address'}{' '}
                                ({collab.role})
                              </span>
                              <span className="font-mono text-accent">{collab.percentage}%</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Warning */}
                      <div className="flex items-start gap-3 p-4 border border-warning/30 bg-warning/5">
                        <AlertCircle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
                        <div className="text-body-sm">
                          <p className="font-medium text-warning">Important</p>
                          <p className="text-gray-400">
                            This action will register your song on the blockchain.
                            Song metadata and splits can be updated later, but the ISRC registration is permanent.
                          </p>
                        </div>
                      </div>

                      {/* Transaction Status */}
                      {(isPending || isConfirming || isSuccess || error) && (
                        <div
                          className={cn(
                            'p-4 border',
                            isSuccess
                              ? 'border-success/30 bg-success/5'
                              : error
                              ? 'border-error/30 bg-error/5'
                              : 'border-accent/30 bg-accent/5'
                          )}
                        >
                          {isPending && (
                            <div className="flex items-center gap-3">
                              <Loader2 className="w-5 h-5 animate-spin text-accent" />
                              <span>Waiting for wallet confirmation...</span>
                            </div>
                          )}
                          {isConfirming && (
                            <div className="flex items-center gap-3">
                              <Loader2 className="w-5 h-5 animate-spin text-accent" />
                              <span>Transaction pending...</span>
                            </div>
                          )}
                          {isSuccess && (
                            <div className="flex items-center gap-3">
                              <Check className="w-5 h-5 text-success" />
                              <div>
                                <p className="font-medium text-success">Song registered</p>
                                <a
                                  href={`https://polygonscan.com/tx/${hash}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-body-sm text-gray-400 hover:text-white"
                                >
                                  View transaction
                                </a>
                              </div>
                            </div>
                          )}
                          {error && (
                            <div className="flex items-center gap-3">
                              <AlertCircle className="w-5 h-5 text-error" />
                              <span className="text-error">Transaction failed. Please try again.</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="flex justify-between mt-8">
                      <Button
                        variant="outline"
                        onClick={() => setStep(2)}
                        disabled={isPending || isConfirming}
                      >
                        Back
                      </Button>
                      <Button
                        variant="accent"
                        onClick={handleSubmit}
                        disabled={isPending || isConfirming || isSuccess}
                      >
                        {(isPending || isConfirming) && <Loader2 className="w-5 h-5 animate-spin" />}
                        {isSuccess ? 'Registered' : 'Register song'}
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  Mic2,
  Users2,
  Building2,
  User,
  FileText,
  Repeat,
  Layers,
  Check,
  AlertTriangle,
  Lock,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import {
  SPLIT_TEMPLATES,
  SplitTemplate,
  getPopularTemplates,
  templateToFormData,
} from '@/lib/splitTemplates';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { cn } from '@/lib/utils';

interface SplitTemplateSelectorProps {
  userAddress?: string;
  onSelect: (recipients: { address: string; percentage: number; role: string }[]) => void;
  onLockToggle?: (locked: boolean) => void;
}

const ICONS: Record<string, React.ElementType> = {
  Users,
  Mic2,
  Users2,
  Building2,
  User,
  FileText,
  Repeat,
  Layers,
};

export default function SplitTemplateSelector({
  userAddress,
  onSelect,
  onLockToggle,
}: SplitTemplateSelectorProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [showAllTemplates, setShowAllTemplates] = useState(false);
  const [lockConfirmed, setLockConfirmed] = useState(false);
  const [showLockWarning, setShowLockWarning] = useState(false);

  const popularTemplates = getPopularTemplates();
  const displayedTemplates = showAllTemplates ? SPLIT_TEMPLATES : popularTemplates;

  const handleSelect = (template: SplitTemplate) => {
    setSelectedTemplate(template.id);
    const formData = templateToFormData(template, userAddress);
    onSelect(formData);
  };

  const handleLockToggle = () => {
    if (!lockConfirmed) {
      setShowLockWarning(true);
    } else {
      setLockConfirmed(false);
      onLockToggle?.(false);
    }
  };

  const confirmLock = () => {
    setLockConfirmed(true);
    setShowLockWarning(false);
    onLockToggle?.(true);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="overline flex items-center gap-2">
          <Layers className="w-4 h-4 text-accent" />
          Quick Templates
        </p>
        <button
          onClick={() => setShowAllTemplates(!showAllTemplates)}
          className="text-caption text-accent hover:opacity-80 flex items-center gap-1"
        >
          {showAllTemplates ? (
            <>
              Show Less <ChevronUp className="w-3 h-3" />
            </>
          ) : (
            <>
              Show All ({SPLIT_TEMPLATES.length}) <ChevronDown className="w-3 h-3" />
            </>
          )}
        </button>
      </div>

      {/* Template Grid */}
      <div className="grid grid-cols-2 gap-2">
        {displayedTemplates.map((template) => {
          const Icon = ICONS[template.icon] || Users;
          const isSelected = selectedTemplate === template.id;

          return (
            <button
              key={template.id}
              onClick={() => handleSelect(template)}
              className={cn(
                'p-3 border text-left transition-all',
                isSelected
                  ? 'border-accent bg-accent/10'
                  : 'border-[#1a1a1a] bg-[#0a0a0a] hover:border-gray-700'
              )}
            >
              <div className="flex items-start gap-2">
                <div
                  className={cn(
                    'p-1.5',
                    isSelected ? 'bg-accent/20' : 'bg-white/5'
                  )}
                >
                  <Icon
                    className={cn(
                      'w-4 h-4',
                      isSelected ? 'text-accent' : 'text-gray-500'
                    )}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-body-sm truncate flex items-center gap-1">
                    {template.name}
                    {isSelected && <Check className="w-3 h-3 text-accent" />}
                  </div>
                  <div className="text-caption text-gray-500 mt-0.5">
                    {template.recipients.length} recipient
                    {template.recipients.length > 1 ? 's' : ''}
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected Template Preview */}
      {selectedTemplate && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 bg-[#0a0a0a] border border-[#1a1a1a]"
        >
          <p className="overline mb-2">Template Preview</p>
          <div className="space-y-1">
            {SPLIT_TEMPLATES.find((t) => t.id === selectedTemplate)?.recipients.map(
              (r, i) => (
                <div key={i} className="flex items-center justify-between text-body-sm">
                  <span className="text-gray-400">{r.role}</span>
                  <span className="font-mono text-accent">{r.percentage}%</span>
                </div>
              )
            )}
          </div>
        </motion.div>
      )}

      {/* Lock Option */}
      <div className="pt-4 border-t border-[#1a1a1a]">
        <button
          onClick={handleLockToggle}
          className={cn(
            'w-full p-3 border flex items-center justify-between transition-all',
            lockConfirmed
              ? 'border-error/50 bg-error/5'
              : 'border-[#1a1a1a] bg-[#0a0a0a] hover:bg-white/5'
          )}
        >
          <div className="flex items-center gap-2">
            <Lock className={cn('w-4 h-4', lockConfirmed ? 'text-error' : 'text-gray-500')} />
            <div className="text-left">
              <div className="text-body-sm font-medium">
                {lockConfirmed ? 'Splits Will Be Locked' : 'Lock Splits Permanently'}
              </div>
              <div className="text-caption text-gray-500">
                {lockConfirmed
                  ? 'Cannot be undone after registration'
                  : 'Optional - prevent future changes'}
              </div>
            </div>
          </div>
          <div
            className={cn(
              'w-5 h-5 border flex items-center justify-center',
              lockConfirmed
                ? 'border-error bg-error'
                : 'border-gray-600 bg-transparent'
            )}
          >
            {lockConfirmed && <Check className="w-3 h-3 text-white" />}
          </div>
        </button>
      </div>

      {/* Lock Warning Modal */}
      <Modal open={showLockWarning} onClose={() => setShowLockWarning(false)}>
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-error/15">
            <AlertTriangle className="w-6 h-6 text-error" />
          </div>
          <h3 className="font-display text-heading-sm">Irreversible action</h3>
        </div>

        <div className="text-gray-400 text-body-sm space-y-3 mb-6">
          <p>
            <strong className="text-white">Warning:</strong> Locking splits is permanent
            and cannot be undone.
          </p>
          <p>Once locked:</p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>Split percentages cannot be changed</li>
            <li>Recipients cannot be added or removed</li>
            <li>This action is recorded on-chain forever</li>
          </ul>
          <p>
            This is typically used when all parties agree to fixed terms that should
            never change.
          </p>
        </div>

        <div className="flex gap-3">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => setShowLockWarning(false)}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            className="flex-1"
            onClick={confirmLock}
          >
            <Lock className="w-4 h-4" />
            Lock Permanently
          </Button>
        </div>
      </Modal>
    </div>
  );
}

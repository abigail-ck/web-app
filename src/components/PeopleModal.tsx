import React from 'react';
import { motion } from 'motion/react';
import { Contributor } from '../types';
import { X } from 'lucide-react';
import { WatermarkFond } from './WatermarkFond';

interface PeopleModalProps {
  isOpen: boolean;
  onClose: () => void;
  contributors: Contributor[];
  currentUser: string;
  totalPeople: number;
}

/** Simple guest list: names only. Bottom sheet on phones, centered card on larger screens. */
export const PeopleModal: React.FC<PeopleModalProps> = ({ isOpen, onClose, contributors, currentUser, totalPeople }) => {
  if (!isOpen) return null;

  const sorted = [...contributors].sort((a, b) => {
    const aMe = a.name.toLowerCase() === currentUser.toLowerCase();
    const bMe = b.name.toLowerCase() === currentUser.toLowerCase();
    if (aMe !== bMe) return aMe ? -1 : 1;
    return a.name.localeCompare(b.name, 'es');
  });

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-[#2C241E]/60 backdrop-blur-sm">
      <div className="absolute inset-0" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full sm:max-w-md bg-[#FAF7F0] border border-[#D4C7B5] rounded-t-3xl sm:rounded-2xl shadow-2xl max-h-[85dvh] flex flex-col"
      >
        <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-[#D4C7B5]/60">
          <div>
            <h2 className="font-display text-xl font-semibold text-[#2C241E] leading-none">Invitados</h2>
            <p className="font-ui text-xs text-[#68795A] mt-1.5 tabular-nums">{totalPeople} personas en el evento</p>
          </div>
          <button
            onClick={onClose}
            aria-label="Cerrar"
            className="p-2 -mr-2 text-[#2C241E]/60 hover:text-[#2C241E] hover:bg-[#2C241E]/5 rounded-full transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        <ul className="overflow-y-auto px-5 divide-y divide-[#D4C7B5]/40 flex-1">
          {sorted.map((person) => {
            const isMe = person.name.toLowerCase() === currentUser.toLowerCase();
            return (
              <li key={person.id} className="py-3 flex items-center gap-3">
                <span
                  className="shrink-0 w-9 h-9 rounded-full text-white flex items-center justify-center font-ui text-xs"
                  style={{ backgroundColor: person.avatarColor }}
                >
                  {person.initials}
                </span>
                <span className="font-ui text-sm text-[#2C241E] truncate">{person.name}</span>
                {isMe && (
                  <span className="ml-auto font-ui text-[10px] uppercase tracking-wider bg-[#C48B9F] text-white px-2 py-0.5 rounded-full">
                    tú
                  </span>
                )}
              </li>
            );
          })}
        </ul>

        <div className="px-5 py-4 pb-safe border-t border-[#D4C7B5]/60 flex justify-center">
          <WatermarkFond size="sm" variant="dark" />
        </div>
      </motion.div>
    </div>
  );
};

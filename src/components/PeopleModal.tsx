import React from 'react';
import { motion } from 'motion/react';
import { Contributor } from '../types';
import { X, Users, Camera, Sparkles, Award } from 'lucide-react';
import { WatermarkFond } from './WatermarkFond';

interface PeopleModalProps {
  isOpen: boolean;
  onClose: () => void;
  contributors: Contributor[];
  currentUser: string;
  onSelectContributor?: (contributorName: string) => void;
}

export const PeopleModal: React.FC<PeopleModalProps> = ({
  isOpen,
  onClose,
  contributors,
  currentUser,
  onSelectContributor,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2C241E]/60 backdrop-blur-sm animate-fadeIn">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative w-full max-w-lg bg-[#FAF7F0] border border-[#D4C7B5] rounded-2xl shadow-2xl p-6 sm:p-8 max-h-[85vh] flex flex-col justify-between overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#D4C7B5]/60">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#68795A]/10 text-[#68795A] rounded-xl">
              <Users size={22} />
            </div>
            <div>
              <h2 className="font-serif-vintage text-2xl sm:text-3xl text-[#2C241E] font-medium leading-none">
                Fotógrafos del Diario
              </h2>
              <p className="font-typewriter text-xs text-[#68795A] mt-1">
                203 invitados compartiendo sus recuerdos
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-[#2C241E]/50 hover:text-[#2C241E] hover:bg-[#2C241E]/5 rounded-full transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Current Active User Highlight */}
        <div className="my-4 p-3.5 bg-[#C48B9F]/10 border border-[#C48B9F]/30 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#C48B9F] text-white flex items-center justify-center font-typewriter font-bold text-sm shadow-sm">
              {currentUser.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-serif-vintage font-semibold text-base text-[#2C241E]">
                  {currentUser}
                </span>
                <span className="text-[10px] font-typewriter bg-[#C48B9F] text-white px-1.5 py-0.2 rounded-full uppercase">
                  Tú
                </span>
              </div>
              <p className="text-xs text-[#2C241E]/60 font-typewriter">
                Conectado para capturar el evento
              </p>
            </div>
          </div>
        </div>

        {/* Contributor List */}
        <div className="overflow-y-auto pr-1 divide-y divide-[#D4C7B5]/40 flex-1 my-2">
          {contributors.map((person) => (
            <div
              key={person.id}
              onClick={() => {
                onSelectContributor?.(person.name);
                onClose();
              }}
              className="py-3 px-2 flex items-center justify-between hover:bg-[#2C241E]/5 rounded-xl transition-colors cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-full text-white flex items-center justify-center font-typewriter font-medium text-sm shadow-sm transition-transform group-hover:scale-105"
                  style={{ backgroundColor: person.avatarColor }}
                >
                  {person.initials}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-typewriter font-semibold text-sm text-[#2C241E]">
                      {person.name}
                    </span>
                    {person.role && (
                      <span className="text-[10px] font-typewriter text-[#68795A] bg-[#68795A]/10 px-1.5 py-0.5 rounded">
                        {person.role}
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] font-typewriter text-[#2C241E]/50">
                    Activo hace {person.lastActive}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 text-xs font-typewriter text-[#2C241E]/70 bg-[#FAF7F0] border border-[#D4C7B5]/60 px-2.5 py-1 rounded-full group-hover:border-[#68795A]">
                <Camera size={13} className="text-[#68795A]" />
                <span>{person.photoCount} fotos</span>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-[#D4C7B5]/60 flex items-center justify-between text-xs text-[#2C241E]/60 font-typewriter">
          <span>ES.1983 • Diario Colectivo</span>
          <WatermarkFond size="sm" variant="dark" />
        </div>
      </motion.div>
    </div>
  );
};

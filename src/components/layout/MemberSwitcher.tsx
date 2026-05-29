'use client';

import { Member } from '@/types';
import ScrollRow from '@/components/ui/ScrollRow';
import { cn } from '@/lib/utils';

interface MemberSwitcherProps {
  members: Member[];
  activeMemberId: string | null;
  onMemberChange: (memberId: string) => void;
  dark?: boolean;
}

export default function MemberSwitcher({
  members,
  activeMemberId,
  onMemberChange,
  dark = false,
}: MemberSwitcherProps) {
  return (
    <ScrollRow inset={!dark}>
      {members.map((member) => {
        const isActive = member.id === activeMemberId;
        return (
          <button
            key={member.id}
            onClick={() => onMemberChange(member.id)}
            className={cn(
              'px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200 flex-shrink-0 max-w-[140px] truncate',
              isActive
                ? 'bg-accent text-accent-foreground'
                : dark
                  ? 'bg-white/10 text-white/80 border border-white/20 hover:border-white/35'
                  : 'bg-surface-elevated text-ink-muted border border-border hover:border-ink-muted'
            )}
          >
            {member.name}
          </button>
        );
      })}
    </ScrollRow>
  );
}

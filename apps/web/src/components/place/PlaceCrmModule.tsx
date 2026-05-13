import type { PlaceCrmContact, PlaceCrmInteraction } from "../../lib/types";
import { PlaceCrmContactForm, type PlaceCrmContactDraft } from "./PlaceCrmContactForm";
import { PlaceCrmContactRow, type PlaceCrmInteractionDraft } from "./PlaceCrmContactRow";
import { PlaceCrmHistoryDrawer } from "./PlaceCrmHistoryDrawer";

type PlaceCrmStageCounts = {
  contacted: number;
  converted: number;
  lead: number;
};

type PlaceCrmModuleProps = {
  busy: boolean;
  contactCountLabel: string;
  contacts: PlaceCrmContact[];
  conversionRate: number;
  draft: PlaceCrmContactDraft;
  followUpDraftsByContact: Record<string, string>;
  followUpsDue: number;
  historyContactId: string;
  interactionDraftsByContact: Record<string, PlaceCrmInteractionDraft>;
  interactionsByContact: Record<string, PlaceCrmInteraction[]>;
  ownerDraftsByContact: Record<string, string>;
  ownerListId: string;
  ownerOptions: string[];
  stageCounts: PlaceCrmStageCounts;
  todayDate: string;
  emptyInteractionDraft: PlaceCrmInteractionDraft;
  onArchiveContact: (contact: PlaceCrmContact) => void;
  onChangeDraft: (draft: PlaceCrmContactDraft) => void;
  onChangeFollowUpDraft: (contact: PlaceCrmContact, value: string) => void;
  onChangeInteractionDraft: (contact: PlaceCrmContact, draft: PlaceCrmInteractionDraft) => void;
  onChangeOwnerDraft: (contact: PlaceCrmContact, value: string) => void;
  onCloseHistory: () => void;
  onCreateContact: () => void;
  onCreateInteraction: (contact: PlaceCrmContact) => void;
  onMarkContacted: (contact: PlaceCrmContact) => void;
  onMarkConverted: (contact: PlaceCrmContact) => void;
  onOpenHistory: (contact: PlaceCrmContact) => void;
  onSaveHistoryFollowUp: (contact: PlaceCrmContact) => void;
  onUpdateFollowUp: (contact: PlaceCrmContact) => void;
  onUpdateOwner: (contact: PlaceCrmContact) => void;
};

export function PlaceCrmModule({
  busy,
  contactCountLabel,
  contacts,
  conversionRate,
  draft,
  emptyInteractionDraft,
  followUpDraftsByContact,
  followUpsDue,
  historyContactId,
  interactionDraftsByContact,
  interactionsByContact,
  ownerDraftsByContact,
  ownerListId,
  ownerOptions,
  stageCounts,
  todayDate,
  onArchiveContact,
  onChangeDraft,
  onChangeFollowUpDraft,
  onChangeInteractionDraft,
  onChangeOwnerDraft,
  onCloseHistory,
  onCreateContact,
  onCreateInteraction,
  onMarkContacted,
  onMarkConverted,
  onOpenHistory,
  onSaveHistoryFollowUp,
  onUpdateFollowUp,
  onUpdateOwner,
}: PlaceCrmModuleProps) {
  const drawerContact = contacts.find((contact) => contact.id === historyContactId) || null;

  return (
    <div className="place-booking-panel">
      <div className="place-booking-head">
        <strong>CRM do local</strong>
        <span>{contactCountLabel} | {conversionRate}% conversao</span>
      </div>
      <div className="place-analytics-grid compact">
        <div>
          <strong>{stageCounts.lead}</strong>
          <span>Novos leads</span>
        </div>
        <div>
          <strong>{stageCounts.contacted}</strong>
          <span>Contatados</span>
        </div>
        <div>
          <strong>{stageCounts.converted}</strong>
          <span>Convertidos</span>
        </div>
        <div>
          <strong>{followUpsDue}</strong>
          <span>Follow-ups hoje</span>
        </div>
      </div>
      <PlaceCrmContactForm busy={busy} draft={draft} ownerListId={ownerListId} ownerOptions={ownerOptions} onChange={onChangeDraft} onSubmit={onCreateContact} />
      <div className="place-booking-list">
        {contacts.slice(0, 6).map((contact) => {
          const followUpDraft = followUpDraftsByContact[contact.id] ?? contact.nextContactOn ?? todayDate;
          const followUpDue = contact.status !== "converted" && contact.nextContactOn && contact.nextContactOn <= todayDate;
          const ownerDraft = ownerDraftsByContact[contact.id] ?? contact.ownerLabel;
          const interactionDraft = interactionDraftsByContact[contact.id] || emptyInteractionDraft;
          const recentInteractions = interactionsByContact[contact.id] || [];
          return (
            <PlaceCrmContactRow
              key={contact.id}
              busy={busy}
              contact={contact}
              followUpDraft={followUpDraft}
              followUpDue={followUpDue}
              interactionCount={recentInteractions.length}
              interactionDraft={interactionDraft}
              ownerDraft={ownerDraft}
              ownerListId={ownerListId}
              onArchive={() => onArchiveContact(contact)}
              onCreateInteraction={() => onCreateInteraction(contact)}
              onFollowUpDraftChange={(value) => onChangeFollowUpDraft(contact, value)}
              onInteractionDraftChange={(nextDraft) => onChangeInteractionDraft(contact, nextDraft)}
              onMarkContacted={() => onMarkContacted(contact)}
              onMarkConverted={() => onMarkConverted(contact)}
              onOpenHistory={() => onOpenHistory(contact)}
              onOwnerDraftChange={(value) => onChangeOwnerDraft(contact, value)}
              onUpdateFollowUp={() => onUpdateFollowUp(contact)}
              onUpdateOwner={() => onUpdateOwner(contact)}
            />
          );
        })}
        {!contacts.length ? <p className="subtle">Sem contatos no CRM.</p> : null}
      </div>
      <PlaceCrmHistoryDrawer
        busy={busy}
        contact={drawerContact}
        interactions={drawerContact ? interactionsByContact[drawerContact.id] || [] : []}
        onClose={onCloseHistory}
        onMarkConverted={onMarkConverted}
        onSaveFollowUp={onSaveHistoryFollowUp}
      />
    </div>
  );
}

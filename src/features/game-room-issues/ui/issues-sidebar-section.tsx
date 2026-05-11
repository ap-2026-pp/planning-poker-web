import { Box, Typography } from '@mui/material';
import { useMemo, useState } from 'react';

import type { Issue } from '@entities/issue';
import { type IssueDraft } from '../model/types';
import { IssueFormCard } from './issue-form-card';
import { IssuesActionsMenu } from './issues-actions-menu';
import { IssuesEmptyState } from './issues-empty-state';
import { IssuesList } from './issues-list';
import styles from '@widgets/game-room-sidebar/ui/game-room-sidebar.module.css';

type IssuesSidebarSectionProps = {
    issues: Issue[];
    canManageIssues: boolean;
    canRevealCards: boolean;
    onAddIssue?: (payload: { title: string }) => Promise<void>;
    onUpdateIssue?: (
        issueId: string,
        payload: { title: string; code?: string; description?: string },
    ) => Promise<void>;
    onDeleteIssue?: (issueId: string) => Promise<void>;
    onSetIssueActive?: (issueId: string) => Promise<void>;
    onMoveIssue?: (issueId: string, direction: 'up' | 'down') => Promise<void>;
    onReorderIssues?: (issueIds: string[]) => Promise<void>;
};

const initialDraft: IssueDraft = {
    title: '',
    code: '',
    description: '',
};

export const IssuesSidebarSection = ({
    issues,
    canManageIssues,
    canRevealCards,
    onAddIssue,
    onUpdateIssue,
    onDeleteIssue,
    onSetIssueActive,
    onMoveIssue,
    onReorderIssues,
}: IssuesSidebarSectionProps) => {
    const [issueMode, setIssueMode] = useState<'list' | 'create' | 'edit'>('list');
    const [selectedIssueId, setSelectedIssueId] = useState<string | null>(null);
    const [isSubmittingIssue, setIsSubmittingIssue] = useState(false);
    const [issueDraft, setIssueDraft] = useState<IssueDraft>(initialDraft);

    const visibleIssues = useMemo(
        () =>
            issues
                .filter((issue) => !issue.isRemoved)
                .sort((left, right) => left.order - right.order),
        [issues],
    );

    const resetIssueDraft = () => {
        setIssueDraft(initialDraft);
    };

    const openCreateIssue = () => {
        if (!canManageIssues) {
            return;
        }

        resetIssueDraft();
        setSelectedIssueId(null);
        setIssueMode('create');
    };

    const openEditIssue = (issue: Issue) => {
        if (!canManageIssues) {
            return;
        }

        setSelectedIssueId(issue.id);
        setIssueDraft({
            title: issue.title ?? '',
            code: issue.code ?? '',
            description: issue.description ?? '',
        });
        setIssueMode('edit');
    };

    const closeIssueForm = () => {
        resetIssueDraft();
        setSelectedIssueId(null);
        setIssueMode('list');
    };

    const handleCreateIssue = async () => {
        if (!canManageIssues || !issueDraft.title.trim() || !onAddIssue) {
            return;
        }

        try {
            setIsSubmittingIssue(true);
            await onAddIssue({ title: issueDraft.title.trim() });
            closeIssueForm();
        } finally {
            setIsSubmittingIssue(false);
        }
    };

    const handleUpdateIssue = async () => {
        if (!canManageIssues || !selectedIssueId || !issueDraft.title.trim() || !onUpdateIssue) {
            return;
        }

        try {
            setIsSubmittingIssue(true);
            await onUpdateIssue(selectedIssueId, {
                title: issueDraft.title.trim(),
                code: issueDraft.code.trim() || undefined,
                description: issueDraft.description.trim() || undefined,
            });
            closeIssueForm();
        } finally {
            setIsSubmittingIssue(false);
        }
    };

    return (
        <Box className={styles.sidebarContent}>
            <Box className={styles.issuesToolbar}>
                <Box>
                    <Typography className={styles.issuesTitle}>Issues</Typography>
                    <Typography className={styles.issuesSubtitle}>
                        {visibleIssues.length} {visibleIssues.length === 1 ? 'issue' : 'issues'}
                    </Typography>
                </Box>

                <IssuesActionsMenu isCurrentParticipantMaster={canManageIssues} />
            </Box>

            <Box className={styles.issuesScrollArea}>
                {issueMode === 'create' ? (
                    <IssueFormCard
                        mode="create"
                        draft={issueDraft}
                        isSubmitting={isSubmittingIssue}
                        onChange={setIssueDraft}
                        onCancel={closeIssueForm}
                        onSubmit={() => void handleCreateIssue()}
                    />
                ) : null}

                {issueMode === 'edit' ? (
                    <IssueFormCard
                        mode="edit"
                        draft={issueDraft}
                        isSubmitting={isSubmittingIssue}
                        onChange={setIssueDraft}
                        onCancel={closeIssueForm}
                        onSubmit={() => void handleUpdateIssue()}
                    />
                ) : null}

                {issueMode === 'list' ? (
                    !visibleIssues.length ? (
                        <IssuesEmptyState
                            isCurrentParticipantMaster={canManageIssues}
                            onAddIssue={openCreateIssue}
                        />
                    ) : (
                        <IssuesList
                            issues={visibleIssues}
                            canManageIssues={canManageIssues}
                            canRevealCards={canRevealCards}
                            onEditIssue={openEditIssue}
                            onAddAnotherIssue={openCreateIssue}
                            onDeleteIssue={onDeleteIssue}
                            onSetIssueActive={onSetIssueActive}
                            onMoveIssue={onMoveIssue}
                            onReorderIssues={onReorderIssues}
                        />
                    )
                ) : null}
            </Box>
        </Box>
    );
};
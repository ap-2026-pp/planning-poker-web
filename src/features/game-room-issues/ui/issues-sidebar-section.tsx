import { Box, Typography } from '@mui/material';
import { useMemo, useState } from 'react';

import type { ImportPlaneIssuesPayload, Issue } from '@entities/issue';
import { type IssueDraft } from '../model/types';
import { ImportPlaneIssuesDialog } from './import-plane-issues-dialog';
import { IssueFormCard } from './issue-form-card';
import { IssuesActionsMenu } from './issues-actions-menu';
import { IssuesEmptyState } from './issues-empty-state';
import { IssuesList } from './issues-list';
import { FormDialog } from '@shared/ui/form-layout';
import styles from '@shared/ui/game-room-sidebar/game-room-issues.module.css';
import sidebarStyles from '@shared/ui/game-room-sidebar/game-room-sidebar.module.css';


type IssuesSidebarSectionProps = {
    issues: Issue[];
    canManageIssues: boolean;
    canRevealCards: boolean;
    onAddIssue?: (payload: { title: string }) => Promise<void>;
    onUpdateIssue?: (
        issueId: string,
        payload: { title: string; code?: string; url?: string; description?: string },
    ) => Promise<void>;
    onDeleteIssue?: (issueId: string) => Promise<void>;
    onDeleteAllIssues?: () => Promise<void>;
    onExportIssuesAsCsv?: () => Promise<void>;
    onImportIssuesFromPlane?: (payload: ImportPlaneIssuesPayload) => Promise<void>;
    onSetIssueActive?: (issueId: string) => Promise<void>;
    onMoveIssue?: (issueId: string, direction: 'up' | 'down') => Promise<void>;
    onReorderIssues?: (issueIds: string[]) => Promise<void>;
};

const initialDraft: IssueDraft = {
    title: '',
    code: '',
    url: '',
    description: '',
};

export const IssuesSidebarSection = ({
    issues,
    canManageIssues,
    canRevealCards,
    onAddIssue,
    onUpdateIssue,
    onDeleteIssue,
    onDeleteAllIssues,
    onExportIssuesAsCsv,
    onImportIssuesFromPlane,
    onSetIssueActive,
    onMoveIssue,
    onReorderIssues,
}: IssuesSidebarSectionProps) => {
    const [issueMode, setIssueMode] = useState<'list' | 'create'>('list');
    const [selectedIssueId, setSelectedIssueId] = useState<string | null>(null);
    const [isEditIssueDialogOpen, setEditIssueDialogOpen] = useState(false);
    const [isSubmittingIssue, setIsSubmittingIssue] = useState(false);
    const [issueDraft, setIssueDraft] = useState<IssueDraft>(initialDraft);

    const [isImportPlaneOpen, setImportPlaneOpen] = useState(false);
    const [isImportingPlane, setImportingPlane] = useState(false);
    const [importPlaneError, setImportPlaneError] = useState<string | null>(null);

    const visibleIssues = useMemo(
        () =>
            issues
                .filter((issue) => !issue.isRemoved)
                .sort((left, right) => left.order - right.order),
        [issues],
    );

    const selectedIssue = useMemo(
        () => visibleIssues.find((issue) => issue.id === selectedIssueId) ?? null,
        [selectedIssueId, visibleIssues],
    );

    const isSelectedIssueImported = Boolean(selectedIssue?.url);

    const resetIssueDraft = () => {
        setIssueDraft(initialDraft);
    };

    const openCreateIssue = () => {
        if (!canManageIssues) {
            return;
        }

        resetIssueDraft();
        setSelectedIssueId(null);
        setEditIssueDialogOpen(false);
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
            url: issue.url ?? '',
            description: issue.description ?? '',
        });
        setIssueMode('list');
        setEditIssueDialogOpen(true);
    };

    const closeCreateIssueForm = () => {
        resetIssueDraft();
        setSelectedIssueId(null);
        setIssueMode('list');
    };

    const closeEditIssueDialog = () => {
        resetIssueDraft();
        setSelectedIssueId(null);
        setEditIssueDialogOpen(false);
    };

    const handleCreateIssue = async () => {
        if (!canManageIssues || !issueDraft.title.trim() || !onAddIssue) {
            return;
        }

        try {
            setIsSubmittingIssue(true);
            await onAddIssue({ title: issueDraft.title.trim() });
            closeCreateIssueForm();
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
                url: issueDraft.url.trim() || undefined,
                description: issueDraft.description.trim() || undefined,
            });

            closeEditIssueDialog();
        } finally {
            setIsSubmittingIssue(false);
        }
    };

    const handleImportFromPlane = async (payload: ImportPlaneIssuesPayload) => {
        if (!canManageIssues || !onImportIssuesFromPlane || isImportingPlane) {
            return;
        }

        setImportingPlane(true);
        setImportPlaneError(null);

        try {
            await onImportIssuesFromPlane(payload);
            setImportPlaneOpen(false);
        } catch (error) {
            setImportPlaneError(
                error instanceof Error ? error.message : 'Не вдалося імпортувати issues з Plane',
            );
        } finally {
            setImportingPlane(false);
        }
    };

    return (
        <>
            <Box className={sidebarStyles.sidebarContent}>
                <Box className={styles.issuesToolbar}>
                    <Box>
                        <Typography className={styles.issuesTitle}>Issues</Typography>
                        <Typography className={styles.issuesSubtitle}>
                            {visibleIssues.length} {visibleIssues.length === 1 ? 'issue' : 'issues'}
                        </Typography>
                    </Box>

                    <IssuesActionsMenu
                        isCurrentParticipantMaster={canManageIssues}
                        hasIssues={visibleIssues.length > 0}
                        onDeleteAllIssues={onDeleteAllIssues}
                        onExportIssuesAsCsv={onExportIssuesAsCsv}
                        onOpenImportPlaneDialog={() => {
                            setImportPlaneError(null);
                            setImportPlaneOpen(true);
                        }}
                    />
                </Box>

                <Box className={styles.issuesScrollArea}>
                    {issueMode === 'create' ? (
                        <IssueFormCard
                            mode="create"
                            variant="sidebar"
                            draft={issueDraft}
                            isSubmitting={isSubmittingIssue}
                            onChange={setIssueDraft}
                            onCancel={closeCreateIssueForm}
                            onSubmit={() => void handleCreateIssue()}
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

            <FormDialog
                open={isEditIssueDialogOpen}
                onClose={closeEditIssueDialog}
            >
                <IssueFormCard
                    mode="edit"
                    variant="dialog"
                    draft={issueDraft}
                    isImported={isSelectedIssueImported}
                    isSubmitting={isSubmittingIssue}
                    onChange={setIssueDraft}
                    onCancel={closeEditIssueDialog}
                    onSubmit={() => void handleUpdateIssue()}
                />
            </FormDialog>

            <ImportPlaneIssuesDialog
                open={isImportPlaneOpen}
                isSubmitting={isImportingPlane}
                errorMessage={importPlaneError}
                onClose={() => {
                    if (!isImportingPlane) {
                        setImportPlaneOpen(false);
                        setImportPlaneError(null);
                    }
                }}
                onSubmit={handleImportFromPlane}
            />
        </>
    );
};

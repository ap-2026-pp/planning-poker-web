import AddRoundedIcon from '@mui/icons-material/AddRounded';
import {
    closestCenter,
    DndContext,
    DragOverlay,
    type DragEndEvent,
    type DragStartEvent,
    PointerSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { Stack } from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';

import type { Issue } from '@entities/issue';
import styles from '@shared/ui/game-room-sidebar/game-room-issues.module.css';
import { IssueDragOverlayCard, SortableIssueCard } from './sortable-issue-card';

type IssuesListProps = {
    issues: Issue[];
    canManageIssues: boolean;
    canRevealCards: boolean;
    onEditIssue: (issue: Issue) => void;
    onAddAnotherIssue: () => void;
    onDeleteIssue?: (issueId: string) => Promise<void>;
    onSetIssueActive?: (issueId: string) => Promise<void>;
    viewableResultIssueIds?: string[];
    onOpenIssueResult?: (issueId: string) => Promise<void> | void;
    onResetIssueRound?: (issueId: string) => Promise<void>;
    onMoveIssue?: (issueId: string, direction: 'up' | 'down') => Promise<void>;
    onReorderIssues?: (issueIds: string[]) => Promise<void>;
    showAddAnotherIssueButton?: boolean;
};

export const IssuesList = ({
    issues,
    canManageIssues,
    canRevealCards,
    onEditIssue,
    onAddAnotherIssue,
    onDeleteIssue,
    onSetIssueActive,
    viewableResultIssueIds,
    onOpenIssueResult,
    onResetIssueRound,
    onMoveIssue,
    onReorderIssues,
    showAddAnotherIssueButton = true,
}: IssuesListProps) => {
    const orderedIssues = useMemo(
        () =>
            [...issues]
                .filter((issue) => !issue.isRemoved)
                .sort((left, right) => left.order - right.order),
        [issues],
    );

    const [localIssues, setLocalIssues] = useState<Issue[]>(orderedIssues);
    const [activeIssueId, setActiveIssueId] = useState<string | null>(null);
    const canDragIssues = canManageIssues && Boolean(onReorderIssues);

    useEffect(() => {
        setLocalIssues(orderedIssues);
    }, [orderedIssues]);

    useEffect(() => {
        if (activeIssueId && !localIssues.some((issue) => issue.id === activeIssueId)) {
            setActiveIssueId(null);
        }
    }, [activeIssueId, localIssues]);

    const activeIssue = useMemo(
        () => localIssues.find((issue) => issue.id === activeIssueId) ?? null,
        [activeIssueId, localIssues],
    );

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 6,
            },
        }),
    );

    const handleDragStart = (event: DragStartEvent) => {
        if (!canDragIssues) {
            return;
        }

        setActiveIssueId(String(event.active.id));
    };

    const handleDragEnd = async (event: DragEndEvent) => {
        setActiveIssueId(null);

        if (!canDragIssues || !onReorderIssues) {
            return;
        }

        const { active, over } = event;

        if (!over || active.id === over.id) {
            return;
        }

        const oldIndex = localIssues.findIndex((issue) => issue.id === active.id);
        const newIndex = localIssues.findIndex((issue) => issue.id === over.id);

        if (oldIndex < 0 || newIndex < 0) {
            return;
        }

        const previousIssues = localIssues;

        const reordered = arrayMove(localIssues, oldIndex, newIndex).map((issue, index) => ({
            ...issue,
            order: index + 1,
        }));

        setLocalIssues(reordered);

        try {
            await onReorderIssues(reordered.map((issue) => issue.id));
        } catch {
            setLocalIssues(previousIssues);
        }
    };

    return (
        <>
            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragStart={handleDragStart}
                onDragCancel={() => {
                    setActiveIssueId(null);
                }}
                onDragEnd={(event) => {
                    void handleDragEnd(event);
                }}
            >
                <SortableContext
                    items={localIssues.map((issue) => issue.id)}
                    strategy={verticalListSortingStrategy}
                >
                    <Stack className={styles.issueList}>
                        {localIssues.map((issue, index) => (
                            <SortableIssueCard
                                key={issue.id}
                                issue={issue}
                                canManageIssues={canManageIssues}
                                canRevealCards={canRevealCards}
                                isSortableEnabled={canDragIssues}
                                isFirst={index === 0}
                                isLast={index === localIssues.length - 1}
                                onEditIssue={onEditIssue}
                                onDeleteIssue={onDeleteIssue}
                                onSetIssueActive={onSetIssueActive}
                                onResetIssueRound={onResetIssueRound}
                                canViewResult={Boolean(viewableResultIssueIds?.includes(issue.id))}
                                onViewResult={onOpenIssueResult}
                                onMoveIssue={onMoveIssue}
                            />
                        ))}
                    </Stack>
                </SortableContext>

                {typeof document !== 'undefined'
                    ? createPortal(
                        <DragOverlay adjustScale={false} zIndex={1700}>
                            {activeIssue ? (
                                <IssueDragOverlayCard
                                    issue={activeIssue}
                                    canRevealCards={canRevealCards}
                                    canViewResult={Boolean(viewableResultIssueIds?.includes(activeIssue.id))}
                                    onViewResult={onOpenIssueResult}
                                />
                            ) : null}
                        </DragOverlay>,
                        document.body,
                    )
                    : null}
            </DndContext>

            {canManageIssues && showAddAnotherIssueButton ? (
                <button
                    type="button"
                    className={styles.addAnotherIssueButton}
                    onClick={onAddAnotherIssue}
                >
                    <AddRoundedIcon />
                    <span>Add another issue</span>
                </button>
            ) : null}
        </>
    );
};

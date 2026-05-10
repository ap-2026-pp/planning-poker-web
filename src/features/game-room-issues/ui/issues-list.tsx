import AddRoundedIcon from '@mui/icons-material/AddRounded';
import {
    closestCenter,
    DndContext,
    type DragEndEvent,
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
import { useEffect, useState } from 'react';

import type { Issue } from '@entities/issue';
import styles from '@widgets/game-room-sidebar/ui/game-room-sidebar.module.css';
import { SortableIssueCard } from './sortable-issue-card';

type IssuesListProps = {
    issues: Issue[];
    isCurrentParticipantMaster: boolean;
    onEditIssue: (issue: Issue) => void;
    onAddAnotherIssue: () => void;
    onDeleteIssue?: (issueId: string) => Promise<void>;
    onSetIssueActive?: (issueId: string) => Promise<void>;
    onMoveIssue?: (issueId: string, direction: 'up' | 'down') => Promise<void>;
    onReorderIssues?: (issueIds: string[]) => Promise<void>;
};

export const IssuesList = ({
    issues,
    isCurrentParticipantMaster,
    onEditIssue,
    onAddAnotherIssue,
    onDeleteIssue,
    onSetIssueActive,
    onMoveIssue,
    onReorderIssues,
}: IssuesListProps) => {
    const [localIssues, setLocalIssues] = useState<Issue[]>(issues);

    useEffect(() => {
        setLocalIssues(issues);
    }, [issues]);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 6,
            },
        }),
    );

    const handleDragEnd = async (event: DragEndEvent) => {
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
        const reordered = arrayMove(localIssues, oldIndex, newIndex);

        setLocalIssues(reordered);

        try {
            await onReorderIssues?.(reordered.map((issue) => issue.id));
        } catch {
            setLocalIssues(previousIssues);
        }
    };

    return (
        <>
            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
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
                                index={index}
                                isCurrentParticipantMaster={isCurrentParticipantMaster}
                                isFirst={index === 0}
                                isLast={index === localIssues.length - 1}
                                onEditIssue={onEditIssue}
                                onDeleteIssue={onDeleteIssue}
                                onSetIssueActive={onSetIssueActive}
                                onMoveIssue={onMoveIssue}
                            />
                        ))}
                    </Stack>
                </SortableContext>
            </DndContext>

            {isCurrentParticipantMaster ? (
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
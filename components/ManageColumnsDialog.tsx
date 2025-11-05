"use client";

import * as React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stack,
  Checkbox,
  FormControlLabel,
  TextField,
  MenuItem,
  IconButton,
  Divider,
  Typography,
  Paper,
} from "@mui/material";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  addColumn,
  reorderColumns,
  toggleColumnVisibility,
} from "@/features/table/tableSlice";
import { setManageColumnsOpen } from "@/features/prefs/prefsSlice";
import type { ColumnDef, ColumnType } from "@/types";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

const schema = z.object({
  label: z.string().min(1, "Label required"),
  key: z
    .string()
    .min(1, "Key required")
    .regex(
      /^[a-zA-Z_][a-zA-Z0-9_]*$/,
      "Use letters/numbers/_ (start with letter/_ )"
    ),
  type: z.enum(["text", "number", "email", "select"]).default("text"),
  options: z.string().optional(),
});
type FormValues = z.infer<typeof schema>;

function SortableRow({ col }: { col: ColumnDef }) {
  const dispatch = useAppDispatch();
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: col.key });
  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    background: isDragging ? "rgba(128,128,128,0.08)" : undefined,
  };
  return (
    <Paper
      ref={setNodeRef}
      variant="outlined"
      sx={{ p: 1, mb: 1 }}
      style={style}
    >
      <Stack
        direction="row"
        spacing={1}
        alignItems="center"
        justifyContent="space-between"
      >
        <Stack direction="row" spacing={1} alignItems="center">
          <IconButton
            size="small"
            {...attributes}
            {...listeners}
            aria-label="drag"
          >
            <DragIndicatorIcon fontSize="small" />
          </IconButton>
          <Typography variant="body2" sx={{ minWidth: 160 }}>
            {col.label}
          </Typography>
        </Stack>
        <FormControlLabel
          control={
            <Checkbox
              checked={col.visible}
              onChange={(_, checked) =>
                dispatch(
                  toggleColumnVisibility({ key: col.key, visible: checked })
                )
              }
            />
          }
          label="Visible"
        />
      </Stack>
    </Paper>
  );
}

export default function ManageColumnsDialog() {
  const dispatch = useAppDispatch();
  const columns = useAppSelector((s) => s.table.columns)
    .slice()
    .sort((a, b) => a.order - b.order);
  const [items, setItems] = React.useState(columns.map((c) => c.key));
  React.useEffect(() => setItems(columns.map((c) => c.key)), [columns]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } })
  );

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { type: "text" },
  });

  const onSubmit = (values: FormValues) => {
    const options =
      values.type === "select" && values.options
        ? values.options
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
        : undefined;

    dispatch(
      addColumn({
        key: values.key,
        label: values.label,
        type: values.type as ColumnType,
        options,
      })
    );
    reset({ label: "", key: "", type: "text", options: "" });
  };

  const onDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const oldIndex = items.indexOf(active.id as string);
    const newIndex = items.indexOf(over.id as string);
    const newItems = arrayMove(items, oldIndex, newIndex);
    setItems(newItems);
    newItems.forEach((key, idx) =>
      dispatch(reorderColumns({ key, newOrder: idx }))
    );
  };

  return (
    <Dialog
      open
      onClose={() => dispatch(setManageColumnsOpen(false))}
      fullWidth
      maxWidth="sm"
    >
      <DialogTitle>Manage Columns</DialogTitle>
      <DialogContent dividers>
        <Typography variant="subtitle2" sx={{ mb: 1 }}>
          Show/Hide & Reorder
        </Typography>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={onDragEnd}
        >
          <SortableContext items={items} strategy={verticalListSortingStrategy}>
            {columns.map((c) => (
              <SortableRow key={c.key} col={c} />
            ))}
          </SortableContext>
        </DndContext>

        <Divider sx={{ my: 2 }} />
        <Typography variant="subtitle2" sx={{ mb: 1 }}>
          Add New Field
        </Typography>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
            <TextField
              label="Label"
              size="small"
              {...register("label")}
              error={!!errors.label}
              helperText={errors.label?.message}
            />
            <TextField
              label="Key"
              size="small"
              {...register("key")}
              error={!!errors.key}
              helperText={errors.key?.message}
            />
            <TextField
              select
              label="Type"
              size="small"
              defaultValue="text"
              {...register("type")}
              sx={{ minWidth: 140 }}
            >
              <MenuItem value="text">Text</MenuItem>
              <MenuItem value="number">Number</MenuItem>
              <MenuItem value="email">Email</MenuItem>
              <MenuItem value="select">Select</MenuItem>
            </TextField>
            {watch("type") === "select" && (
              <TextField
                label="Options (comma-separated)"
                size="small"
                {...register("options")}
                sx={{ flex: 1 }}
              />
            )}
            <Button type="submit" variant="contained">
              Add
            </Button>
          </Stack>
        </form>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => dispatch(setManageColumnsOpen(false))}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}

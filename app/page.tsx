"use client";

import { Box, Card, CardContent, Stack } from "@mui/material";
import TopBar from "@/components/TopBar";
import DataTable from "@/components/DataTable";
import ManageColumnsDialog from "@/components/ManageColumnsDialog";
import { useAppSelector } from "@/store/hooks";

export default function Page() {
  const open = useAppSelector((s) => s.prefs.manageColumnsOpen);

  return (
    <Box className="container" sx={{ py: 3 }}>
      <Stack spacing={2}>
        <TopBar />
        <Card variant="outlined" className="tableCard">
          <CardContent>
            <DataTable />
          </CardContent>
        </Card>
      </Stack>
      {open && <ManageColumnsDialog />}
    </Box>
  );
}

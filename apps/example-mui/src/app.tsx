import { useRHFIntentForm } from "@intentform/adapter-react-hook-form";
import { createIntentForm } from "@intentform/core";
import { openaiProvider } from "@intentform/provider-openai";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import { useMemo, useState } from "react";
import { accidentReportModel, contactFormModel } from "./models.js";
import { muiComponents } from "./mui-field.js";

const MODELS = [contactFormModel, accidentReportModel];

export function App() {
  const [apiKey, setApiKey] = useState<string>(
    (import.meta.env.VITE_OPENAI_API_KEY as string | undefined) ?? ""
  );
  const [promptText, setPromptText] = useState("");
  const [submittedValues, setSubmittedValues] = useState<Record<
    string,
    unknown
  > | null>(null);

  const engine = useMemo(
    () =>
      createIntentForm({
        components: muiComponents,
        models: MODELS,
        provider: openaiProvider({ apiKey, dangerouslyAllowBrowser: true }),
      }),
    [apiKey]
  );

  const { error, form, onSubmit, resolution, resolve, status } =
    useRHFIntentForm(engine, {
      onSubmit: (values) => {
        setSubmittedValues(values);
      },
    });

  function handleResolve() {
    setSubmittedValues(null);
    resolve(promptText).catch(() => undefined);
  }

  const resolvedModel =
    resolution === null
      ? undefined
      : engine.getModels().find((m) => m.id === resolution.modelId);

  return (
    <Box maxWidth={680} mx="auto" px={2} py={4}>
      <Typography fontWeight={700} mb={1} variant="h4">
        IntentForm — MUI Example
      </Typography>
      <Typography color="text.secondary" mb={4} variant="body1">
        Type your intent, get a prefilled MUI form
      </Typography>

      <Box mb={3}>
        <TextField
          fullWidth
          helperText={
            apiKey.length === 0
              ? "Enter your OpenAI API key to continue"
              : undefined
          }
          label="OpenAI API key"
          onChange={(e) => setApiKey(e.target.value)}
          placeholder="sk-..."
          type="password"
          value={apiKey}
        />
      </Box>

      <Box mb={2}>
        <TextField
          fullWidth
          label="Intent"
          minRows={3}
          multiline
          onChange={(e) => setPromptText(e.target.value)}
          placeholder="e.g. I need to report a car accident that happened today at Main St..."
          value={promptText}
        />
      </Box>

      <Box mb={4}>
        <Button
          disabled={status === "loading" || apiKey.length === 0}
          disableElevation
          onClick={handleResolve}
          startIcon={
            status === "loading" ? (
              <CircularProgress color="inherit" size={16} />
            ) : undefined
          }
          variant="contained"
        >
          {status === "loading" ? "Loading…" : "Resolve"}
        </Button>
      </Box>

      {error !== null && (
        <Box mb={3}>
          <Alert severity="error">{error}</Alert>
        </Box>
      )}

      {resolvedModel !== undefined && resolution !== null && (
        <Paper sx={{ p: 3, mb: 3 }} variant="outlined">
          <Typography fontWeight={600} mb={2} variant="h6">
            {resolvedModel.label}
          </Typography>
          <form onSubmit={onSubmit}>
            {resolvedModel.fields
              .filter((f) => !resolution.hiddenFields.has(f.id))
              .map((field) => {
                const CustomComponent = muiComponents[field.type];
                return (
                  <div key={field.id}>
                    <CustomComponent
                      field={field}
                      onChange={(val) => form.setValue(field.id, val)}
                      required={resolution.requiredFields.has(field.id)}
                      value={form.watch(field.id) ?? ""}
                    />
                  </div>
                );
              })}
            <Box mt={2}>
              <Button disableElevation type="submit" variant="contained">
                Submit
              </Button>
            </Box>
          </form>
        </Paper>
      )}

      {submittedValues !== null && (
        <Box>
          <Typography fontWeight={600} mb={1} variant="subtitle1">
            Submitted values
          </Typography>
          <Paper
            component="pre"
            sx={{
              p: 2,
              overflow: "auto",
              fontSize: 13,
              lineHeight: 1.6,
              fontFamily: "monospace",
              bgcolor: "grey.50",
              m: 0,
            }}
            variant="outlined"
          >
            {JSON.stringify(submittedValues, null, 2)}
          </Paper>
        </Box>
      )}
    </Box>
  );
}

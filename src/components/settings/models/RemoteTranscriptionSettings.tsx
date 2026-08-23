import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { invoke } from "@tauri-apps/api/core";
import { useSettingsStore } from "@/stores/settingsStore";
import { SettingContainer, SettingsGroup, ToggleSwitch } from "@/components/ui";
import { Input } from "@/components/ui/Input";

export const RemoteTranscriptionSettings: React.FC = () => {
  const { t } = useTranslation();
  const settings = useSettingsStore((state) => state.settings);
  const refreshSettings = useSettingsStore((state) => state.refreshSettings);
  const [enabled, setEnabled] = useState(false);
  const [url, setUrl] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [model, setModel] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!settings) return;
    const remote = settings as typeof settings & {
      remote_transcription_enabled?: boolean;
      remote_transcription_url?: string;
      remote_transcription_api_keys?: Record<string, string>;
      remote_transcription_model?: string;
    };
    setEnabled(remote.remote_transcription_enabled ?? false);
    setUrl(remote.remote_transcription_url ?? "");
    setApiKey(remote.remote_transcription_api_keys?.remote ?? "");
    setModel(remote.remote_transcription_model ?? "");
  }, [settings]);

  const save = async (nextEnabled = enabled) => {
    setSaving(true);
    try {
      await invoke("change_remote_transcription_setting", {
        enabled: nextEnabled,
        url,
        apiKey,
        model,
      });
      await refreshSettings();
    } finally {
      setSaving(false);
    }
  };

  return (
    <SettingsGroup title={t("settings.models.remote.title")}>
      <ToggleSwitch
        checked={enabled}
        onChange={(value) => {
          setEnabled(value);
          void save(value);
        }}
        disabled={!enabled && !url.trim()}
        isUpdating={saving}
        label={t("settings.models.remote.enabled")}
        description={t("settings.models.remote.enabledDescription")}
        grouped
      />
      <SettingContainer
        title={t("settings.models.remote.url")}
        description={t("settings.models.remote.urlDescription")}
        grouped
      >
        <Input
          value={url}
          onChange={(event) => setUrl(event.target.value)}
          onBlur={() => void save()}
          placeholder="http://localhost:8000/api/v1"
          className="w-80"
        />
      </SettingContainer>
      <SettingContainer
        title={t("settings.models.remote.apiKey")}
        description={t("settings.models.remote.apiKeyDescription")}
        grouped
      >
        <Input
          type="password"
          value={apiKey}
          onChange={(event) => setApiKey(event.target.value)}
          onBlur={() => void save()}
          className="w-80"
        />
      </SettingContainer>
      <SettingContainer
        title={t("settings.models.remote.model")}
        description={t("settings.models.remote.modelDescription")}
        grouped
      >
        <Input
          value={model}
          onChange={(event) => setModel(event.target.value)}
          onBlur={() => void save()}
          placeholder="e.g. whisper-1"
          className="w-80"
        />
      </SettingContainer>
    </SettingsGroup>
  );
};

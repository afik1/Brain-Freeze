<script setup lang="ts">
import { ref, onMounted } from "vue";
import { api } from "./api";
import type { HealthResponse } from "./types";

type ApiStatus = "checking" | "connected" | "error";

const apiStatus = ref<ApiStatus>("checking");

onMounted(async () => {
  try {
    await api.get<HealthResponse>("/health");
    apiStatus.value = "connected";
  } catch {
    apiStatus.value = "error";
  }
});
</script>

<template>
  <main class="starter">
    <div class="starter__logo" aria-hidden="true">🍦</div>
    <h1 class="starter__title">Brain Freeze</h1>
    <p class="starter__subtitle">Workshop starter</p>

    <div
      class="starter__status"
      :class="{
        'starter__status--checking': apiStatus === 'checking',
        'starter__status--connected': apiStatus === 'connected',
        'starter__status--error': apiStatus === 'error',
      }"
    >
      <span class="starter__status-dot" aria-hidden="true"></span>
      <span v-if="apiStatus === 'checking'">API: connecting…</span>
      <span v-else-if="apiStatus === 'connected'">API: connected</span>
      <span v-else>API: unreachable — is the API running?</span>
    </div>
  </main>
</template>

<style scoped>
.starter {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100dvh;
  gap: 0.5rem;
  padding: 2rem;
  text-align: center;
}

.starter__logo {
  font-size: 4rem;
  line-height: 1;
  margin-bottom: 0.5rem;
}

.starter__title {
  font-size: 2.5rem;
  font-weight: 700;
  letter-spacing: -0.04em;
  background: linear-gradient(135deg, #fff 30%, var(--color-accent-light));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.starter__subtitle {
  font-size: 1rem;
  color: var(--color-text-muted);
  margin-bottom: 1.5rem;
}

.starter__status {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: var(--radius-lg);
  font-size: 0.875rem;
  font-weight: 500;
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  transition: border-color var(--transition-base);
}

.starter__status--checking {
  color: var(--color-text-muted);
}

.starter__status--connected {
  border-color: var(--color-success);
  color: var(--color-success);
}

.starter__status--error {
  border-color: var(--color-error);
  color: var(--color-error);
}

.starter__status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: currentColor;
  flex-shrink: 0;
}

.starter__status--checking .starter__status-dot {
  animation: pulse 1.4s ease-in-out infinite;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.3;
  }
}
</style>

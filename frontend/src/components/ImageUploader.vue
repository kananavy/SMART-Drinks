<template>
  <div class="img-uploader">

    <!-- ── COMPACT MODE (settings) ── -->
    <div v-if="compact" class="compact-zone" :class="{ dragging: isDragging, 'has-image': previewUrl }"
      @click="triggerInput"
      @dragover.prevent="isDragging = true"
      @dragleave="isDragging = false"
      @drop.prevent="onDrop"
    >
      <!-- Thumbnail -->
      <div class="compact-thumb">
        <img v-if="previewUrl" :src="previewUrl" class="compact-thumb-img" />
        <div v-else class="compact-thumb-empty">
          <span>{{ isDragging ? '📂' : '🖼️' }}</span>
        </div>
        <!-- Mini progress ring overlay -->
        <div v-if="uploading" class="compact-thumb-uploading">
          <span class="compact-spin">⟳</span>
        </div>
        <div v-else-if="uploadDone" class="compact-thumb-done">✓</div>
      </div>

      <!-- Info -->
      <div class="compact-info">
        <p class="compact-title">{{ previewUrl ? 'Changer l\'image' : 'Ajouter une image' }}</p>
        <p class="compact-sub">{{ isDragging ? 'Relâchez ici…' : 'Glissez ou cliquez · JPG, PNG, WebP · Max 5 Mo' }}</p>
        <div v-if="uploading" class="compact-progress-track">
          <div class="compact-progress-fill" :style="{ width: progress + '%' }"></div>
        </div>
      </div>

      <!-- Action chip -->
      <div class="compact-cta" :class="{ active: isDragging }">
        <span>{{ previewUrl ? '🔄' : '＋' }}</span>
      </div>

      <input ref="inputRef" type="file" accept="image/*" class="upload-hidden-input" @change="onFileChange" />
    </div>

    <!-- ── FULL MODE (product / category cards) ── -->
    <div v-else
      class="upload-zone"
      :class="{ dragging: isDragging, 'has-image': previewUrl }"
      @click="triggerInput"
      @dragover.prevent="isDragging = true"
      @dragleave="isDragging = false"
      @drop.prevent="onDrop"
    >
      <transition name="fade">
        <img v-if="previewUrl" :src="previewUrl" class="upload-preview" />
      </transition>

      <div class="upload-overlay" :class="{ visible: !previewUrl || isDragging }">
        <div class="upload-icon-wrap">
          <span class="upload-icon">{{ isDragging ? '📂' : '🖼️' }}</span>
        </div>
        <p class="upload-main-text">
          {{ isDragging ? 'Relâchez pour uploader' : (previewUrl ? 'Changer l\'image' : 'Glissez une image ou cliquez') }}
        </p>
        <p class="upload-sub-text">JPG, PNG, WebP · Max 5 Mo</p>
      </div>

      <div v-if="uploading" class="upload-progress-bar">
        <div class="upload-progress-fill" :style="{ width: progress + '%' }"></div>
      </div>

      <div v-if="uploading" class="upload-state-badge uploading">
        <span class="animate-spin-slow">⟳</span> Upload...
      </div>
      <div v-else-if="uploadDone" class="upload-state-badge done">
        ✓ Enregistré
      </div>

      <input ref="inputRef" type="file" accept="image/*" class="upload-hidden-input" @change="onFileChange" />
    </div>

    <!-- Remove button -->
    <button v-if="previewUrl && !uploading" @click.stop="removeImage"
      :class="['remove-btn glass border transition-all', compact ? 'remove-btn-compact' : 'remove-btn-full border-danger/20 text-danger hover:bg-danger/10']">
      <span>🗑</span>
      <span v-if="!compact"> Supprimer l'image</span>
    </button>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import api from '@/services/api';

const props = defineProps({
  modelValue: { type: String, default: '' },
  uploadKey: { type: String, default: '' },
  uploadUrl: { type: String, default: '' },
  fieldName: { type: String, default: 'file' },
  compact:   { type: Boolean, default: false },
});

const emit = defineEmits(['update:modelValue', 'uploaded']);

const inputRef = ref(null);
const isDragging = ref(false);
const uploading = ref(false);
const uploadDone = ref(false);
const progress = ref(0);
const previewUrl = ref(props.modelValue || '');

watch(() => props.modelValue, (val) => {
  if (val && val !== previewUrl.value) previewUrl.value = val;
});

const triggerInput = () => inputRef.value?.click();

const onDrop = (e) => {
  isDragging.value = false;
  const file = e.dataTransfer.files[0];
  if (file) uploadFile(file);
};

const onFileChange = (e) => {
  const file = e.target.files[0];
  if (file) uploadFile(file);
  e.target.value = '';
};

const uploadFile = async (file) => {
  if (!file.type.startsWith('image/')) return;

  previewUrl.value = URL.createObjectURL(file);
  uploading.value = true;
  uploadDone.value = false;
  progress.value = 0;

  try {
    const fd = new FormData();
    fd.append(props.fieldName, file);

    let url = props.uploadUrl;
    if (!url && props.uploadKey) url = `/admin/settings/upload/${props.uploadKey}`;
    if (!url) {
      emit('uploaded', file, previewUrl.value);
      uploading.value = false;
      return;
    }

    const { data } = await api.post(url, fd, {
      onUploadProgress: (e) => {
        progress.value = Math.round((e.loaded / e.total) * 100);
      },
    });

    if (data.success) {
      const path = data.data?.path || data.data?.image || '';
      previewUrl.value = path;
      emit('update:modelValue', path);
      emit('uploaded', file, path);
      uploadDone.value = true;
      setTimeout(() => { uploadDone.value = false; }, 3000);
    }
  } catch (err) {
    console.error('Upload failed', err);
  } finally {
    uploading.value = false;
  }
};

const removeImage = () => {
  previewUrl.value = '';
  emit('update:modelValue', '');
};
</script>

<style scoped>
/* ── Shared ── */
.upload-hidden-input { display: none; }
.img-uploader { display: flex; flex-direction: column; gap: 0.5rem; }

/* ── COMPACT ZONE ── */
.compact-zone {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 10px 14px;
  border-radius: 14px;
  border: 1.5px dashed rgba(99,102,241,0.2);
  background: rgba(99,102,241,0.03);
  cursor: pointer;
  transition: border-color 0.2s, background 0.2s;
  position: relative;
  overflow: hidden;
}
.compact-zone:hover {
  border-color: rgba(99,102,241,0.45);
  background: rgba(99,102,241,0.07);
}
.compact-zone.dragging {
  border-color: #6366f1;
  border-style: solid;
  background: rgba(99,102,241,0.12);
}
.compact-zone.has-image {
  border-style: solid;
  border-color: rgba(99,102,241,0.18);
}

.compact-thumb {
  position: relative;
  width: 48px;
  height: 48px;
  border-radius: 10px;
  overflow: hidden;
  flex-shrink: 0;
  background: rgba(99,102,241,0.1);
  border: 1px solid rgba(99,102,241,0.2);
  display: flex;
  align-items: center;
  justify-content: center;
}
.compact-thumb-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.compact-thumb-empty {
  font-size: 1.25rem;
  opacity: 0.5;
}
.compact-thumb-uploading {
  position: absolute;
  inset: 0;
  background: rgba(10,10,26,0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
}
.compact-thumb-done {
  position: absolute;
  inset: 0;
  background: rgba(16,185,129,0.85);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  font-weight: 900;
  color: white;
}
.compact-spin {
  display: inline-block;
  animation: spin-slow 1s linear infinite;
  color: #6366f1;
}

.compact-info {
  flex: 1;
  min-width: 0;
}
.compact-title {
  font-size: 11px;
  font-weight: 800;
  color: rgba(255,255,255,0.8);
  margin-bottom: 2px;
}
.compact-sub {
  font-size: 9px;
  font-weight: 600;
  color: rgba(255,255,255,0.35);
  text-transform: uppercase;
  letter-spacing: 0.07em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.compact-progress-track {
  height: 2px;
  border-radius: 999px;
  background: rgba(255,255,255,0.08);
  margin-top: 6px;
  overflow: hidden;
}
.compact-progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #6366f1, #8b5cf6);
  transition: width 0.2s;
}

.compact-cta {
  width: 28px;
  height: 28px;
  border-radius: 8px;
  background: rgba(99,102,241,0.12);
  border: 1px solid rgba(99,102,241,0.25);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.9rem;
  flex-shrink: 0;
  transition: background 0.2s, transform 0.15s;
}
.compact-zone:hover .compact-cta,
.compact-cta.active {
  background: rgba(99,102,241,0.25);
  transform: scale(1.1);
}

/* ── FULL ZONE ── */
.upload-zone {
  position: relative;
  height: 160px;
  border-radius: 16px;
  border: 2px dashed rgba(99,102,241,0.25);
  background: rgba(99,102,241,0.04);
  overflow: hidden;
  cursor: pointer;
  transition: border-color 0.2s, background 0.2s, transform 0.15s;
}
.upload-zone:hover { border-color: rgba(99,102,241,0.5); background: rgba(99,102,241,0.08); }
.upload-zone.dragging { border-color: #6366f1; background: rgba(99,102,241,0.15); transform: scale(1.01); }
.upload-zone.has-image { border-style: solid; border-color: rgba(99,102,241,0.2); }
.upload-zone.has-image:hover .upload-overlay { opacity: 1; }

.upload-preview { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }

.upload-overlay {
  position: absolute; inset: 0;
  display: flex; flex-direction: column;
  align-items: center; justify-content: center; gap: 8px;
  background: rgba(10,10,26,0.6);
  backdrop-filter: blur(4px);
  transition: opacity 0.2s;
  z-index: 2;
}
.upload-overlay:not(.visible) { opacity: 0; }

.upload-icon-wrap {
  width: 52px; height: 52px;
  border-radius: 14px;
  background: rgba(99,102,241,0.15);
  border: 1px solid rgba(99,102,241,0.3);
  display: flex; align-items: center; justify-content: center;
  transition: transform 0.2s;
}
.upload-zone:hover .upload-icon-wrap,
.upload-zone.dragging .upload-icon-wrap { transform: scale(1.1); background: rgba(99,102,241,0.25); }
.upload-icon { font-size: 1.5rem; }
.upload-main-text { font-size: 12px; font-weight: 700; color: rgba(255,255,255,0.85); text-align: center; }
.upload-sub-text { font-size: 10px; font-weight: 600; color: rgba(255,255,255,0.4); text-transform: uppercase; letter-spacing: 0.08em; }

.upload-progress-bar {
  position: absolute; bottom: 0; left: 0; right: 0;
  height: 3px; background: rgba(255,255,255,0.1); z-index: 3;
}
.upload-progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #6366f1, #8b5cf6);
  transition: width 0.2s;
}
.upload-state-badge {
  position: absolute; bottom: 8px; right: 8px;
  padding: 4px 10px; border-radius: 8px;
  font-size: 10px; font-weight: 800;
  text-transform: uppercase; letter-spacing: 0.06em;
  display: flex; align-items: center; gap: 4px; z-index: 4;
}
.upload-state-badge.uploading { background: rgba(99,102,241,0.9); color: white; }
.upload-state-badge.done { background: rgba(16,185,129,0.9); color: white; }

/* ── Remove buttons ── */
.remove-btn {
  cursor: pointer;
  background: transparent;
  border-radius: 8px;
}
.remove-btn-full {
  align-self: flex-start;
  font-size: 11px; font-weight: 700;
  padding: 6px 14px;
  display: flex; align-items: center; gap: 6px;
}
.remove-btn-compact {
  align-self: flex-start;
  font-size: 10px;
  padding: 3px 8px;
  border-color: rgba(239,68,68,0.2);
  color: rgb(239,68,68);
  display: flex; align-items: center; gap: 4px;
}
.remove-btn-compact:hover { background: rgba(239,68,68,0.08); }

/* ── Animations ── */
@keyframes spin-slow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
.animate-spin-slow { display: inline-block; animation: spin-slow 1.2s linear infinite; }
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

/* ── Light mode ── */
[data-theme="light"] .compact-zone {
  background: rgba(99,102,241,0.03);
  border-color: rgba(99,102,241,0.18);
}
[data-theme="light"] .compact-zone:hover {
  background: rgba(99,102,241,0.07);
}
[data-theme="light"] .compact-title { color: #1e1e2e; }
[data-theme="light"] .compact-sub { color: #94a3b8; }
[data-theme="light"] .upload-zone { background: rgba(99,102,241,0.03); border-color: rgba(99,102,241,0.2); }
[data-theme="light"] .upload-zone:hover { background: rgba(99,102,241,0.07); }
[data-theme="light"] .upload-overlay { background: rgba(255,255,255,0.75); backdrop-filter: blur(4px); }
[data-theme="light"] .upload-main-text { color: #1e1e2e; }
[data-theme="light"] .upload-sub-text { color: #94a3b8; }
</style>

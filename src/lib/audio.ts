/**
 * 口语评测音频工具。
 *
 * 讯飞 ISE 只接受 16000Hz / 16bit / 单声道 WAV，前端把录音转好再推给服务端，
 * 服务端就能零转码透传（部署机不需要装 ffmpeg）。
 */

/** 录音约束：关掉浏览器自动处理，口语评测要的是原始音。 */
export const RAW_AUDIO_CONSTRAINTS: MediaTrackConstraints = {
  echoCancellation: false,
  noiseSuppression: false,
  autoGainControl: false,
};

/** 挑一个当前浏览器支持的录音容器：opus 优先，兼容 Safari 的 mp4/AAC。 */
export function pickAudioMime(): string {
  if (typeof MediaRecorder === "undefined") return "";
  return (
    ["audio/webm;codecs=opus", "audio/webm", "audio/mp4", "audio/mpeg"].find((type) =>
      MediaRecorder.isTypeSupported(type),
    ) || ""
  );
}

/** MediaRecorder 产出的 blob（webm/opus、mp4/AAC…）→ 16000Hz / 16bit / 单声道 WAV。 */
export async function toWav16k(blob: Blob): Promise<Blob> {
  const decoded = await decodeAudio(blob);

  // 离线渲染：不发声、比实时快，顺便完成重采样（48k→16k）与多声道下混
  const frames = Math.max(1, Math.ceil(decoded.duration * 16000));
  const offline = new OfflineAudioContext(1, frames, 16000);
  const source = offline.createBufferSource();
  source.buffer = decoded;
  source.connect(offline.destination);
  source.start();
  const pcm = (await offline.startRendering()).getChannelData(0);

  return encodeWav16k(pcm);
}

async function decodeAudio(blob: Blob): Promise<AudioBuffer> {
  const Ctor =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctor) throw new Error("当前浏览器不支持音频解码");
  const context = new Ctor();
  try {
    return await context.decodeAudioData(await blob.arrayBuffer());
  } finally {
    void context.close();
  }
}

/** 按 RIFF/WAVE 规范手写 44 字节头 + 16bit 小端 PCM。 */
function encodeWav16k(pcm: Float32Array): Blob {
  const buffer = new ArrayBuffer(44 + pcm.length * 2);
  const view = new DataView(buffer);
  const writeText = (offset: number, text: string) => {
    for (let i = 0; i < text.length; i += 1) view.setUint8(offset + i, text.charCodeAt(i));
  };

  writeText(0, "RIFF");
  view.setUint32(4, 36 + pcm.length * 2, true); // RIFF 块长度 = 44 - 8 + 数据长度
  writeText(8, "WAVE");
  writeText(12, "fmt ");
  view.setUint32(16, 16, true); // fmt 块长度
  view.setUint16(20, 1, true); // 1 = PCM
  view.setUint16(22, 1, true); // 单声道
  view.setUint32(24, 16000, true); // 采样率
  view.setUint32(28, 32000, true); // 字节率 = 16000 × 1 × 16 / 8
  view.setUint16(32, 2, true); // 块对齐 = 声道 × 位深 / 8
  view.setUint16(34, 16, true); // 位深
  writeText(36, "data");
  view.setUint32(40, pcm.length * 2, true);

  for (let i = 0; i < pcm.length; i += 1) {
    // 钳位到 [-1,1] 再 ×0x7fff：超范围会绕回成反向爆音
    const sample = Math.max(-1, Math.min(1, pcm[i] || 0));
    view.setInt16(44 + i * 2, sample * 0x7fff, true);
  }
  return new Blob([buffer], { type: "audio/wav" });
}

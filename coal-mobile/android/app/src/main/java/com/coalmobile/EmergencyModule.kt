package com.coalmobile

import android.content.Context
import android.hardware.camera2.CameraCharacteristics
import android.hardware.camera2.CameraManager
import android.media.AudioManager
import android.media.AudioTrack
import android.media.ToneGenerator
import android.os.Build
import android.os.Handler
import android.os.Looper
import android.os.VibrationEffect
import android.os.Vibrator
import android.os.VibratorManager
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

class EmergencyModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    private val handler = Handler(Looper.getMainLooper())
    private var isAlarmActive = false
    private var isTorchOn = false
    private var toneGenerator: ToneGenerator? = null
    private var cameraManager: CameraManager? = null
    private var cameraId: String? = null

    private var beepToggle = false
    private val sampleRate = 22050
    private var highBeepBuffer: ByteArray? = null
    private var lowBeepBuffer: ByteArray? = null

    init {
        try {
            cameraManager = reactContext.getSystemService(Context.CAMERA_SERVICE) as? CameraManager
            val list = cameraManager?.cameraIdList ?: emptyArray()
            for (id in list) {
                val chars = cameraManager?.getCameraCharacteristics(id)
                val flashAvailable = chars?.get(CameraCharacteristics.FLASH_INFO_AVAILABLE) ?: false
                if (flashAvailable) {
                    cameraId = id
                    break
                }
            }
        } catch (e: Exception) {
            e.printStackTrace()
        }

        try {
            val durationMs = 200
            val numSamples = (sampleRate * durationMs) / 1000
            highBeepBuffer = generateSineWavePcm(1350.0, numSamples, sampleRate)
            lowBeepBuffer = generateSineWavePcm(900.0, numSamples, sampleRate)
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    private fun generateSineWavePcm(freqHz: Double, numSamples: Int, sRate: Int): ByteArray {
        val pcm = ByteArray(numSamples * 2)
        for (i in 0 until numSamples) {
            val angle = 2.0 * Math.PI * i * freqHz / sRate
            val sample = (Math.sin(angle) * 32767.0).toInt().toShort()
            pcm[i * 2] = (sample.toInt() and 0xFF).toByte()
            pcm[i * 2 + 1] = ((sample.toInt() shr 8) and 0xFF).toByte()
        }
        return pcm
    }

    override fun getName(): String = "EmergencyAlert"

    private val alarmRunnable = object : Runnable {
        override fun run() {
            if (!isAlarmActive) return

            // 1. Toggle Flashlight / Torch
            try {
                if (cameraId != null && cameraManager != null) {
                    isTorchOn = !isTorchOn
                    cameraManager?.setTorchMode(cameraId!!, isTorchOn)
                }
            } catch (e: Exception) {
                // In case camera hardware is temporarily locked
            }

            // 2. Play warning beep tone via AudioTrack (Pure PCM sine wave)
            try {
                beepToggle = !beepToggle
                val buffer = if (beepToggle) highBeepBuffer else lowBeepBuffer
                if (buffer != null) {
                    val track = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                        AudioTrack.Builder()
                            .setAudioAttributes(
                                android.media.AudioAttributes.Builder()
                                    .setUsage(android.media.AudioAttributes.USAGE_ALARM)
                                    .setContentType(android.media.AudioAttributes.CONTENT_TYPE_SONIFICATION)
                                    .build()
                            )
                            .setAudioFormat(
                                android.media.AudioFormat.Builder()
                                    .setEncoding(android.media.AudioFormat.ENCODING_PCM_16BIT)
                                    .setSampleRate(sampleRate)
                                    .setChannelMask(android.media.AudioFormat.CHANNEL_OUT_MONO)
                                    .build()
                            )
                            .setBufferSizeInBytes(buffer.size)
                            .setTransferMode(AudioTrack.MODE_STATIC)
                            .build()
                    } else {
                        @Suppress("DEPRECATION")
                        AudioTrack(
                            AudioManager.STREAM_ALARM,
                            sampleRate,
                            android.media.AudioFormat.CHANNEL_OUT_MONO,
                            android.media.AudioFormat.ENCODING_PCM_16BIT,
                            buffer.size,
                            AudioTrack.MODE_STATIC
                        )
                    }
                    track.write(buffer, 0, buffer.size)
                    track.play()
                }
            } catch (e: Exception) {
                // ToneGenerator fallback with GSM standard tone
                try {
                    if (toneGenerator == null) {
                        toneGenerator = ToneGenerator(AudioManager.STREAM_MUSIC, 100)
                    }
                    toneGenerator?.startTone(ToneGenerator.TONE_PROP_BEEP2, 200)
                } catch (ignored: Exception) {}
            }

            // Loop every 380 ms for rapid emergency strobe & warning beep
            handler.postDelayed(this, 380)
        }
    }

    @ReactMethod
    fun startEmergencyAlarm(promise: Promise) {
        try {
            if (isAlarmActive) {
                promise.resolve(true)
                return
            }

            isAlarmActive = true
            isTorchOn = false

            try {
                toneGenerator = ToneGenerator(AudioManager.STREAM_ALARM, 100)
            } catch (e: Exception) {
                e.printStackTrace()
            }

            // Start haptic emergency SOS vibration
            val vibrator = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                val vibratorManager = reactApplicationContext.getSystemService(Context.VIBRATOR_MANAGER_SERVICE) as? VibratorManager
                vibratorManager?.defaultVibrator
            } else {
                @Suppress("DEPRECATION")
                reactApplicationContext.getSystemService(Context.VIBRATOR_SERVICE) as? Vibrator
            }

            val pattern = longArrayOf(0, 400, 200, 400, 200, 400)
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                vibrator?.vibrate(VibrationEffect.createWaveform(pattern, 0))
            } else {
                @Suppress("DEPRECATION")
                vibrator?.vibrate(pattern, 0)
            }

            handler.post(alarmRunnable)
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("ERROR", e.message)
        }
    }

    @ReactMethod
    fun stopEmergencyAlarm(promise: Promise) {
        try {
            isAlarmActive = false
            handler.removeCallbacks(alarmRunnable)

            // Turn off flashlight
            try {
                if (cameraId != null && cameraManager != null) {
                    cameraManager?.setTorchMode(cameraId!!, false)
                    isTorchOn = false
                }
            } catch (e: Exception) {
                e.printStackTrace()
            }

            // Stop tone generator
            try {
                toneGenerator?.stopTone()
                toneGenerator?.release()
                toneGenerator = null
            } catch (e: Exception) {
                e.printStackTrace()
            }

            // Cancel vibration
            val vibrator = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                val vibratorManager = reactApplicationContext.getSystemService(Context.VIBRATOR_MANAGER_SERVICE) as? VibratorManager
                vibratorManager?.defaultVibrator
            } else {
                @Suppress("DEPRECATION")
                reactApplicationContext.getSystemService(Context.VIBRATOR_SERVICE) as? Vibrator
            }
            vibrator?.cancel()

            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("ERROR", e.message)
        }
    }

    @ReactMethod
    fun toggleTorch(enable: Boolean, promise: Promise) {
        try {
            if (cameraId != null && cameraManager != null) {
                cameraManager?.setTorchMode(cameraId!!, enable)
                promise.resolve(true)
            } else {
                promise.resolve(false)
            }
        } catch (e: Exception) {
            promise.reject("TORCH_ERROR", e.message)
        }
    }
}

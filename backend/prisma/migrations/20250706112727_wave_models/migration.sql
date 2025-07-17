-- CreateTable
CREATE TABLE "Wave" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "heartRate" INTEGER NOT NULL,
    "pixelsPerMv" DOUBLE PRECISION NOT NULL,
    "defaultPWavesPerQrs" INTEGER NOT NULL,
    "enableRWavePattern" BOOLEAN NOT NULL,
    "rWavesInPattern" INTEGER,
    "applyRWaveAfterNQrs" INTEGER,
    "enablePWavePattern" BOOLEAN NOT NULL,
    "pWavesInPattern" INTEGER,
    "applyPWaveAfterNQrs" INTEGER,
    "enableCustomBeatSequence" BOOLEAN NOT NULL,
    "normalBeatsBeforeRepeat" INTEGER,

    CONSTRAINT "Wave_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WaveParameter" (
    "id" TEXT NOT NULL,
    "waveId" TEXT NOT NULL,
    "isDefault" BOOLEAN NOT NULL,
    "ordinal" INTEGER,
    "pWaveHeight" DOUBLE PRECISION NOT NULL,
    "pWaveBreadth" DOUBLE PRECISION NOT NULL,
    "qWaveHeight" DOUBLE PRECISION NOT NULL,
    "qWaveBreadth" DOUBLE PRECISION NOT NULL,
    "rWaveHeight" DOUBLE PRECISION NOT NULL,
    "rWaveBreadth" DOUBLE PRECISION NOT NULL,
    "sWaveHeight" DOUBLE PRECISION NOT NULL,
    "sWaveBreadth" DOUBLE PRECISION NOT NULL,
    "tWaveHeight" DOUBLE PRECISION NOT NULL,
    "tWaveBreadth" DOUBLE PRECISION NOT NULL,
    "pqSegmentLength" DOUBLE PRECISION NOT NULL,
    "stSegmentLength" DOUBLE PRECISION NOT NULL,
    "tpSegmentLength" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "WaveParameter_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "WaveParameter" ADD CONSTRAINT "WaveParameter_waveId_fkey" FOREIGN KEY ("waveId") REFERENCES "Wave"("id") ON DELETE CASCADE ON UPDATE CASCADE;

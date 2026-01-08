-- CreateTable
CREATE TABLE "user" (
    "id" SERIAL NOT NULL,
    "firstname" VARCHAR(255) NOT NULL,
    "lastname" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "pseudo" VARCHAR(255) NOT NULL,
    "password" VARCHAR(255) NOT NULL,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "verificationToken" VARCHAR(255),
    "wins" INTEGER NOT NULL DEFAULT 0,
    "losses" INTEGER NOT NULL DEFAULT 0,
    "draws" INTEGER NOT NULL DEFAULT 0,
    "elo" INTEGER NOT NULL DEFAULT 1000,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- CreateIndex
CREATE UNIQUE INDEX "user_pseudo_key" ON "user"("pseudo");

-- CreateIndex
CREATE UNIQUE INDEX "user_verificationToken_key" ON "user"("verificationToken");

-- CreateTable
CREATE TABLE "game" (
    "id" VARCHAR(255) NOT NULL,
    "roomId" VARCHAR(255) NOT NULL,
    "redPlayerId" INTEGER NOT NULL,
    "yellowPlayerId" INTEGER,
    "winner" VARCHAR(255),
    "status" VARCHAR(255) NOT NULL DEFAULT 'waiting',
    "startedAt" TIMESTAMP(3),
    "finishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "game_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "game_roomId_key" ON "game"("roomId");

-- AddForeignKey
ALTER TABLE "game" ADD CONSTRAINT "game_redPlayerId_fkey" FOREIGN KEY ("redPlayerId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "game" ADD CONSTRAINT "game_yellowPlayerId_fkey" FOREIGN KEY ("yellowPlayerId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;


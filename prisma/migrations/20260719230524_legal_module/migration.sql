-- CreateEnum
CREATE TYPE "CaseEtapa" AS ENUM ('ACTIVO', 'PAGADO', 'PENDIENTE', 'ARCHIVADO');

-- CreateTable
CREATE TABLE "legal_case" (
    "id" TEXT NOT NULL,
    "expediente" TEXT NOT NULL,
    "juzgado" TEXT NOT NULL,
    "ciudad" TEXT NOT NULL,
    "etapa" "CaseEtapa" NOT NULL DEFAULT 'ACTIVO',
    "estatus" TEXT,
    "demandado" TEXT NOT NULL,
    "domicilio" TEXT,
    "montoAdeudado" DECIMAL(14,2),
    "interesPct" DECIMAL(5,2),
    "fechaSuscripcion" TIMESTAMP(3),
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "legal_case_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "case_update" (
    "id" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "texto" TEXT NOT NULL,
    "autorId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "case_update_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "oficio" (
    "id" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "numero" TEXT NOT NULL,
    "dependencia" TEXT NOT NULL,
    "estatus" TEXT,
    "observaciones" TEXT,
    "domicilioIngresado" TEXT,
    "domicilioArrojado" TEXT,
    "revisiones" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "oficio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exhorto" (
    "id" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "numero" TEXT,
    "juzgadoDestino" TEXT,
    "estatus" TEXT,
    "seguimiento" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "exhorto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "generated_contract" (
    "id" TEXT NOT NULL,
    "tipo" TEXT NOT NULL DEFAULT 'ARRENDAMIENTO',
    "datos" JSONB NOT NULL,
    "docxPath" TEXT NOT NULL,
    "pdfPath" TEXT,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "generated_contract_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "legal_case_etapa_juzgado_idx" ON "legal_case"("etapa", "juzgado");

-- CreateIndex
CREATE INDEX "legal_case_demandado_idx" ON "legal_case"("demandado");

-- CreateIndex
CREATE INDEX "case_update_caseId_idx" ON "case_update"("caseId");

-- CreateIndex
CREATE INDEX "oficio_caseId_idx" ON "oficio"("caseId");

-- CreateIndex
CREATE INDEX "exhorto_caseId_idx" ON "exhorto"("caseId");

-- AddForeignKey
ALTER TABLE "case_update" ADD CONSTRAINT "case_update_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "legal_case"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "oficio" ADD CONSTRAINT "oficio_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "legal_case"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exhorto" ADD CONSTRAINT "exhorto_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "legal_case"("id") ON DELETE CASCADE ON UPDATE CASCADE;

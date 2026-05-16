const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  ImageRun, Header, Footer, AlignmentType, BorderStyle, WidthType,
  ShadingType, VerticalAlign, PageNumber, TabStopType, TabStopPosition,
} = require('docx');
const path = require('path');
const fs = require('fs');

const GREEN_DARK  = "2D5016";
const GREEN_MED   = "4A7C2F";
const GREEN_LIGHT = "EAF3E0";
const GREEN_BORDER= "6B9E4A";
const WHITE       = "FFFFFF";
const PAGE_WIDTH  = 9638; // A4 - marges

const border   = { style: BorderStyle.SINGLE, size: 1, color: GREEN_BORDER };
const borders  = { top: border, bottom: border, left: border, right: border };
const noBorder = { style: BorderStyle.NONE, size: 0, color: WHITE };
const noBorders= { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder };

// ── Helpers ──────────────────────────────────────────────────────────────────

function label(text) {
  return new TextRun({ text, bold: true, size: 20, color: GREEN_DARK, font: "Arial" });
}
function val(text) {
  return new TextRun({ text: text || "—", size: 20, color: "222222", font: "Arial" });
}
function spacer() {
  return new Paragraph({ spacing: { before: 60, after: 60 }, children: [] });
}
function sectionTitle(text) {
  return new Paragraph({
    spacing: { before: 200, after: 80 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 8, color: GREEN_MED, space: 4 } },
    children: [new TextRun({ text: text.toUpperCase(), bold: true, size: 22, color: GREEN_DARK, font: "Arial" })]
  });
}
function field(labelText, value) {
  return new Paragraph({
    spacing: { before: 60, after: 60 },
    children: [label(labelText + " : "), val(value)]
  });
}
function twoCol(left, right) {
  return new Table({
    width: { size: PAGE_WIDTH, type: WidthType.DXA },
    columnWidths: [PAGE_WIDTH / 2, PAGE_WIDTH / 2],
    borders: { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder, insideH: noBorder, insideV: noBorder },
    rows: [new TableRow({
      children: [
        new TableCell({ borders: noBorders, width: { size: PAGE_WIDTH / 2, type: WidthType.DXA }, children: left }),
        new TableCell({ borders: noBorders, width: { size: PAGE_WIDTH / 2, type: WidthType.DXA }, children: right }),
      ]
    })]
  });
}
function checkVal(val) { return val ? "✔ Oui" : "✘ Non"; }

// ── Génération principale ─────────────────────────────────────────────────────

async function generateDocx(data) {
  const logoPath = path.join(__dirname, '..', 'public', 'logo.jpg');
  const logoData = fs.existsSync(logoPath) ? fs.readFileSync(logoPath) : null;

  const headerChildren = [];

  if (logoData) {
    headerChildren.push(
      new Table({
        width: { size: PAGE_WIDTH, type: WidthType.DXA },
        columnWidths: [2800, PAGE_WIDTH - 2800],
        borders: { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder, insideH: noBorder, insideV: noBorder },
        rows: [new TableRow({
          children: [
            new TableCell({
              borders: noBorders, width: { size: 2800, type: WidthType.DXA },
              verticalAlign: VerticalAlign.CENTER,
              children: [new Paragraph({ children: [new ImageRun({ type: "jpg", data: logoData, transformation: { width: 120, height: 52 }, altText: { title: "Logo", description: "Logo Patsy-Rat", name: "Logo" } })] })]
            }),
            new TableCell({
              borders: noBorders, width: { size: PAGE_WIDTH - 2800, type: WidthType.DXA },
              verticalAlign: VerticalAlign.CENTER,
              shading: { fill: GREEN_DARK, type: ShadingType.CLEAR },
              margins: { top: 120, bottom: 120, left: 200, right: 200 },
              children: [
                new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "COMPTE-RENDU D'INTERVENTION", bold: true, size: 32, color: WHITE, font: "Arial" })] }),
                new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Régulation de nuisibles — Pigeons & Rats", size: 18, color: "C8E6A0", font: "Arial", italics: true })] }),
              ]
            }),
          ]
        })]
      })
    );
  } else {
    headerChildren.push(new Paragraph({
      alignment: AlignmentType.CENTER,
      shading: { fill: GREEN_DARK, type: ShadingType.CLEAR },
      children: [new TextRun({ text: "COMPTE-RENDU D'INTERVENTION — PATSY-RAT", bold: true, size: 28, color: WHITE, font: "Arial" })]
    }));
  }

  const doc = new Document({
    sections: [{
      properties: {
        page: {
          size: { width: 11906, height: 16838 },
          margin: { top: 1000, right: 1134, bottom: 900, left: 1134 }
        }
      },
      headers: { default: new Header({ children: headerChildren }) },
      footers: {
        default: new Footer({
          children: [new Paragraph({
            border: { top: { style: BorderStyle.SINGLE, size: 4, color: GREEN_BORDER, space: 4 } },
            spacing: { before: 80 },
            tabStops: [{ type: TabStopType.RIGHT, position: TabStopPosition.MAX }],
            children: [
              new TextRun({ text: "Patsy-Rat  |  06 77 11 00 80  |  pdaenes@gmail.com  |  SIRET 343 176 368 00029", size: 16, color: "777777", font: "Arial" }),
              new TextRun({ text: "\t", font: "Arial" }),
              new TextRun({ text: "Page ", size: 16, color: "777777", font: "Arial" }),
              new TextRun({ children: [PageNumber.CURRENT], size: 16, color: GREEN_DARK, font: "Arial", bold: true }),
            ]
          })]
        })
      },
      children: [
        spacer(),

        // 1. INFORMATIONS GÉNÉRALES
        sectionTitle("1. Informations générales"),
        spacer(),
        twoCol(
          [
            field("N° de rapport",        data.numeroRapport),
            field("Date d'intervention",  data.dateIntervention),
            field("Horaire",              data.horaire === 'nuit' ? 'De nuit' : 'De jour'),
          ],
          [
            field("Heure d'arrivée",      data.heureArrivee),
            field("Heure de départ",      data.heureDepart),
            field("Durée totale",         data.dureeTotale),
          ]
        ),
        spacer(),

        // 2. CLIENT
        sectionTitle("2. Identification du client"),
        spacer(),
        twoCol(
          [
            field("Raison sociale / Nom", data.clientNom),
            field("Adresse du site",      data.clientAdresse),
            field("Code postal / Ville",  data.clientVille),
          ],
          [
            field("Contact sur site",     data.clientContact),
            field("Téléphone",            data.clientTelephone),
            field("E-mail",               data.clientEmail),
          ]
        ),
        new Paragraph({ spacing: { before: 60, after: 60 }, children: [label("Accompagnateur présent : "), val(checkVal(data.accompagnateur))] }),
        data.accompagnateur
          ? field("Nom de l'accompagnateur", data.accompagnateurNom)
          : new Paragraph({ children: [] }),
        spacer(),

        // 3. INTERVENANT
        sectionTitle("3. Intervenant"),
        spacer(),
        field("Nom", "Patrice DAENES — Patsy-Rat"),
        spacer(),

        // 4. TYPE D'INTERVENTION
        sectionTitle("4. Type d'intervention"),
        spacer(),
        twoCol(
          [
            new Paragraph({ spacing: { before: 60, after: 60 }, children: [label("Espèce(s) ciblée(s) : "), val((data.especes || []).join(", "))] }),
            field("Autre espèce", data.especeAutre),
          ],
          [
            new Paragraph({ spacing: { before: 60, after: 60 }, children: [label("Méthode : "), val(data.methode)] }),
            field("Calibre", data.calibre),
          ]
        ),
        spacer(),

        // 5. RÉSULTATS
        sectionTitle("5. Résultats de l'intervention"),
        spacer(),
        new Table({
          width: { size: PAGE_WIDTH, type: WidthType.DXA },
          columnWidths: [PAGE_WIDTH / 2, PAGE_WIDTH / 2],
          rows: [
            new TableRow({ children: [
              new TableCell({ borders, width: { size: PAGE_WIDTH/2, type: WidthType.DXA }, shading: { fill: GREEN_DARK, type: ShadingType.CLEAR }, margins: { top: 80, bottom: 80, left: 120, right: 120 }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "ESTIMATIF SUR SITE", bold: true, size: 18, color: WHITE, font: "Arial" })] })] }),
              new TableCell({ borders, width: { size: PAGE_WIDTH/2, type: WidthType.DXA }, shading: { fill: GREEN_DARK, type: ShadingType.CLEAR }, margins: { top: 80, bottom: 80, left: 120, right: 120 }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "RÉGULÉS (abattus)", bold: true, size: 18, color: WHITE, font: "Arial" })] })] }),
            ]}),
            new TableRow({ children: [
              new TableCell({ borders, width: { size: PAGE_WIDTH/2, type: WidthType.DXA }, margins: { top: 100, bottom: 100, left: 120, right: 120 }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [val(data.nbEstimatif || "—")] })] }),
              new TableCell({ borders, width: { size: PAGE_WIDTH/2, type: WidthType.DXA }, margins: { top: 100, bottom: 100, left: 120, right: 120 }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [val(data.nbRegules || "—")] })] }),
            ]}),
          ]
        }),
        spacer(),
        new Paragraph({ spacing: { before: 60, after: 60 }, children: [label("Gestion par le client : "), val(checkVal(data.gestionClient))] }),
        new Paragraph({ spacing: { before: 60, after: 60 }, children: [label("Gestion par Patsy-Rat : "), val(checkVal(data.gestionEntreprise))] }),
        new Paragraph({ spacing: { before: 60, after: 60 }, children: [label("Passage équarrissage ATEMAX : "), val(checkVal(data.atemax))] }),
        spacer(),

        // 6. DESCRIPTION
        sectionTitle("6. Description de l'intervention"),
        spacer(),
        field("Conditions d'accès / particularités", data.conditionsAcces),
        spacer(),
        new Paragraph({ spacing: { before: 60, after: 40 }, children: [label("Déroulement :")] }),
        new Paragraph({ spacing: { before: 40, after: 40 }, children: [val(data.deroulement)] }),
        spacer(),
        field("Observations / difficultés", data.observations),
        spacer(),

        // 7. RECOMMANDATIONS
        sectionTitle("7. Recommandations & suivi"),
        spacer(),
        new Paragraph({ spacing: { before: 60, after: 60 }, children: [label("Nouvelle intervention préconisée : "), val(checkVal(data.nouvelleIntervention))] }),
        field("Date prévisionnelle", data.dateSuivi),
        new Paragraph({ spacing: { before: 60, after: 40 }, children: [label("Recommandations :")] }),
        new Paragraph({ spacing: { before: 40, after: 40 }, children: [val(data.recommandations)] }),
        spacer(),

        // 8. VALIDATION
        sectionTitle("8. Commentaires & validation"),
        spacer(),
        new Paragraph({ spacing: { before: 60, after: 40 }, children: [label("Commentaires du client :")] }),
        new Paragraph({ spacing: { before: 40, after: 80 }, children: [val(data.commentairesClient)] }),
        spacer(),
        twoCol(
          [new Paragraph({ shading: { fill: GREEN_LIGHT, type: ShadingType.CLEAR }, spacing: { before: 120, after: 200 }, children: [new TextRun({ text: "Signature intervenant — Patrice DAENES", bold: true, size: 20, color: GREEN_DARK, font: "Arial" })] })],
          [new Paragraph({ shading: { fill: GREEN_LIGHT, type: ShadingType.CLEAR }, spacing: { before: 120, after: 200 }, children: [label("Signature client : "), val(data.clientContact)] })]
        ),
        spacer(),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 100, after: 40 },
          children: [new TextRun({ text: "Ce document constitue un justificatif d'intervention et doit être conservé.", size: 16, italics: true, color: "888888", font: "Arial" })]
        }),
      ]
    }]
  });

  return await Packer.toBuffer(doc);
}

module.exports = { generateDocx };

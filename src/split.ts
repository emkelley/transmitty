import { PDFDocument } from "pdf-lib";
const colors = require("colors");
const homeDir = require("os").homedir();
const AdmZip = require("adm-zip");
const rimraf = require("rimraf");
const fs = require("fs");
const pdf = require("pdf-parse");

const inputFile = `${homeDir}/Desktop/input.pdf`;
const finalPath = `${homeDir}/Desktop/Transmitty Output`;
const outBase = "./out";
const eftPath = "./out/eft";
const chkPath = "./out/checks";

const splitPDFs = async (pathToPdf: string) => {
  console.log(colors.cyan("Splitting PDF..."));
  const docBytes = await fs.promises.readFile(pathToPdf);
  const pdfDoc = await PDFDocument.load(docBytes);
  const numberOfPages = pdfDoc.getPages().length;
  console.log(`> Number of pages: ${numberOfPages}`);

  for (let i = 0; i < numberOfPages; i++) {
    process.stdout.write(`> Progress:  ${i}/${numberOfPages} \r`);
    let fileName = "";
    const subDoc = await PDFDocument.create();
    const [copiedPage] = await subDoc.copyPages(pdfDoc, [i]);
    subDoc.addPage(copiedPage);
    const pdfBytes = await subDoc.save();

    await pdf(pdfBytes).then(async (data: any) => {
      const text = data.text.replace(".", "");
      const textArr = text.split("\n");
      const officeName = cleanFileName(`${textArr[8]}-${textArr[9]}`);

      if (text.includes("Check #")) {
        const checkNumber = Number(
          text
            .split("Check #:")[1]
            .split(" ")[0]
            .replace("Check", "")
            .replace(".", "")
        );
        fileName = `Check-${checkNumber}-${officeName}`;
      }

      if (text.includes("EFT #")) {
        const eftNumber = Number(
          text
            .split("EFT #:")[1]
            .split(" ")[0]
            .replace("Check", "")
            .replace(".", "")
        );
        fileName = `EFT-${eftNumber}-${cleanFileName(officeName)}`;
      }

      await writePdfBytesToFile(
        `tmp/${cleanFileName(fileName)}__${`${i + 1}`.padStart(5, "0")}.pdf`,
        pdfBytes
      );
    });
  }
};

const mergePDFs = async (tmp: string) => {
  console.log("> Done Splitting PDFs...");
  console.log(colors.cyan("Merging PDFs..."));

  let chkCount = 0;

  const files = fs.readdirSync(tmp);
  const names = files.map((file: any) => file.slice(0, -4));

  const checkNumbers = names.filter((file: any) => file.includes("Check-"));
  const eftNumbers = names.filter((file: any) => file.includes("EFT-"));

  const chkGrp = checkNumbers.reduce((acc: any, curr: any) => {
    const checkNumber = curr.split("-")[1];
    if (!acc[checkNumber]) acc[checkNumber] = [];
    acc[checkNumber].push(curr);
    return acc;
  }, {});

  const eftGroupsObj = eftNumbers.reduce((acc: any, curr: any) => {
    const eftNumber = curr.split("-")[1];
    if (!acc[eftNumber]) acc[eftNumber] = [];
    acc[eftNumber].push(curr);
    return acc;
  }, {});

  console.log(`> Checks Total: ${Object.keys(chkGrp).length}`);
  console.log(`> EFTs Total: ${Object.keys(eftGroupsObj).length}`);

  for (const key in chkGrp) {
    if (chkGrp.hasOwnProperty(key)) {
      chkCount++;

      let names = chkGrp[key].sort();

      let mergedPDF = await PDFDocument.create();

      for (const name of names) {
        const pdfFile = await PDFDocument.load(
          fs.readFileSync(`${tmp}/${name}.pdf`)
        );
        const [copiedPage] = await mergedPDF.copyPages(
          pdfFile,
          pdfFile.getPageIndices()
        );
        mergedPDF.addPage(copiedPage);
      }

      const mergedPDFBytes = await mergedPDF.save();

      await writePdfBytesToFile(`${chkPath}/${names[0]}.pdf`, mergedPDFBytes);
      if (chkCount === Object.keys(chkGrp).length) {
        await mergeAllChecks();
      }
    }
  }

  for (const key in eftGroupsObj) {
    if (eftGroupsObj.hasOwnProperty(key)) {
      let names = eftGroupsObj[key].sort();
      let mergedPDF = await PDFDocument.create();

      for (const fileName of names) {
        const pdfFile = await PDFDocument.load(
          fs.readFileSync(`${tmp}/${fileName}.pdf`)
        );
        const [copiedPage] = await mergedPDF.copyPages(
          pdfFile,
          pdfFile.getPageIndices()
        );
        mergedPDF.addPage(copiedPage);
      }

      const mergedPDFBytes = await mergedPDF.save();
      await writePdfBytesToFile(`${eftPath}/${names[0]}.pdf`, mergedPDFBytes);
    }
  }
};

const mergeAllChecks = async () => {
  console.log(colors.cyan("Merging checks..."));

  await sleep(2000);

  const files = fs.readdirSync(chkPath);

  let mergedPDF = await PDFDocument.create();

  for (const fileName of files) {
    const pdfFile = await PDFDocument.load(
      fs.readFileSync(`${chkPath}/${fileName}`)
    );
    const copiedPages = await mergedPDF.copyPages(
      pdfFile,
      pdfFile.getPageIndices()
    );
    copiedPages.forEach((page) => mergedPDF.addPage(page));
  }

  const finalPDF = await mergedPDF.save();

  await writePdfBytesToFile(`${finalPath}/Checks_ALL.pdf`, finalPDF);

  console.log(colors.green("--> Generated Checks_ALL.pdf"));
};

const zipFiles = async () => {
  console.log(colors.yellow("Zipping files..."));

  await sleep(2000);

  const EFT_ZIP = new AdmZip();
  const CHK_ZIP = new AdmZip();

  CHK_ZIP.addLocalFolder(chkPath);
  EFT_ZIP.addLocalFolder(eftPath);

  EFT_ZIP.writeZip(`${finalPath}/EFTs.zip`);
  CHK_ZIP.writeZip(`${finalPath}/Checks.zip`);

  console.log(colors.green("--> Generated EFTs.zip"));
  console.log(colors.green("--> Generated Checks.zip"));
};

const writePdfBytesToFile = async (fileName: string, pdfBytes: Uint8Array) => {
  return fs.promises.writeFile(fileName, pdfBytes);
};

const cleanFileName = (fileName: string) => {
  return fileName
    .trim()
    .replace("#", "")
    .replace(".", "")
    .replace(",", "")
    .replace(/\s/g, "-");
};

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
(async () => {
  console.clear();
  console.log(colors.green("Starting..."));

  if (!fs.existsSync(inputFile)) {
    console.log(colors.yellow("⚠ Error"));
    console.log(
      colors.red("Input file not found! Must have `input.pdf` on desktop.")
    );
    process.exit();
  }

  rimraf.sync("tmp");
  rimraf.sync("out");
  rimraf.sync(finalPath);

  if (!fs.existsSync("./tmp/")) fs.mkdirSync("./tmp/");
  if (!fs.existsSync(outBase)) fs.mkdirSync(outBase);
  if (!fs.existsSync(chkPath)) fs.mkdirSync(chkPath);
  if (!fs.existsSync(eftPath)) fs.mkdirSync(eftPath);
  if (!fs.existsSync(finalPath)) fs.mkdirSync(finalPath);

  await splitPDFs(inputFile);
  await mergePDFs("./tmp");
  await zipFiles();

  rimraf.sync("tmp");
  rimraf.sync("out");

  console.log(colors.magenta(`🎇 Done! 🎇`));
  console.log(colors.magenta(`${finalPath}`));
  require("child_process").exec(
    'start "" "C:\\Users\\PLUTO/Desktop/Transmitty Output"'
  );
})();

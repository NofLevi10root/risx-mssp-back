/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async function (knex) {
  // Deletes ALL existing entries
  await knex("on_premise_velociraptor").del();
  await knex("on_premise_velociraptor").insert([
    {
      config_name: "Lite",
      description: "Quick Short and Very Informative Velociraptor Config",
      config: JSON.stringify({
        Artifacts: [
          {
            name: "Windows.KapeFiles.Targets",
            parameters: { _KapeTriage: true },
          },
        ],
        Resources: {
          CpuLimit: 30,
          MaxExecutionTimeInSeconds: 600,
          MaxIdleTimeInSeconds: 600,
        },
        Configuration: {
          EncryptionScheme: "None",
          EncryptionSchemeValue: "",
          CollectorFileName: "Collector-Lite",
          OutputsFileName: "Collector-Lite-Outputs",
          ZipSplitSizeInMb: 1000,
        },
      }),
    },
    {
      config_name: "Best-Practice",
      description: "Best of Breed Artifacts as recommended by 10Root",
      config: JSON.stringify({
        Artifacts: [
          {
            name: "DetectRaptor.Server.StartHunts",
            parameters: {},
          },
          {
            name: "Generic.Forensic.SQLiteHunter",
            parameters: {},
          },
          {
            name: "Windows.Analysis.EvidenceOfDownload",
            parameters: {},
          },
          {
            name: "Windows.Analysis.EvidenceOfExecution",
            parameters: {},
          },
          {
            name: "Windows.NTFS.MFT",
            parameters: {},
          },
          {
            name: "Windows.Forensics.Usn",
            parameters: {},
          },
          {
            name: "Windows.Network.NetstatEnriched",
            parameters: {},
          },
          {
            name: "Generic.Scanner.ThorZIP",
            parameters: {},
          },
          {
            name: "Exchange.Custom.Windows.Nirsoft.LastActivityView",
            parameters: {},
          },
          {
            name: "Custom.Windows.System.Powershell.PSReadline.QuickWins",
            parameters: {},
          },
          {
            name: "Windows.Forensics.Lnk",
            parameters: {},
          },
          {
            name: "Exchange.PSList.VTLookup.ServerMetaData",
            parameters: {},
          },
          {
            name: "Generic.System.Pstree",
            parameters: {},
          },
          {
            name: "Windows.System.UntrustedBinaries",
            parameters: {},
          },
          {
            name: "Windows.Detection.Yara.Process",
            parameters: {},
          },
          {
            name: "Windows.EventLogs.RDPAuth",
            parameters: {},
          },
          {
            name: "Windows.Attack.UnexpectedImagePath",
            parameters: {},
          },
          {
            name: "Windows.Sys.AllUsers",
            parameters: {},
          },
          {
            name: "Windows.Registry.Sysinternals.Eulacheck",
            parameters: {},
          },
        ],
        Resources: {
          CpuLimit: 30,
          MaxExecutionTimeInSeconds: 600,
          MaxIdleTimeInSeconds: 600,
        },
        Configuration: {
          EncryptionScheme: "None",
          EncryptionSchemeValue: "",
          CollectorFileName: "Collector-Best-Practice",
          OutputsFileName: "Collector-Best-Practice-Outputs",
          ZipSplitSizeInMb: 1000,
        },
      }),
    },
  ]);
};

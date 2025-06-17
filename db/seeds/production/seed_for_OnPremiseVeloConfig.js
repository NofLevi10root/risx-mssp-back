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
            name: "Exchange.Windows.Nirsoft.LastActivityView",
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
          {
            name: "DetectRaptor.Generic.Detection.YaraFile",
            parameters: {},
          },
          {
            name: "DetectRaptor.Generic.Detection.YaraWebshell",
            parameters: {},
          },
          {
            name: "DetectRaptor.Windows.Detection.Amcache",
            parameters: {},
          },
          {
            name: "DetectRaptor.Windows.Detection.Applications",
            parameters: {},
          },
          {
            name: "DetectRaptor.Windows.Detection.BinaryRename",
            parameters: {},
          },
          {
            name: "DetectRaptor.Windows.Detection.Bootloaders",
            parameters: {},
          },
          {
            name: "DetectRaptor.Windows.Detection.Evtx",
            parameters: {},
          },
          {
            name: "DetectRaptor.Windows.Detection.HijackLibsEnv",
            parameters: {},
          },
          {
            name: "DetectRaptor.Windows.Detection.HijackLibsMFT",
            parameters: {},
          },
          {
            name: "DetectRaptor.Windows.Detection.LolDriversMalicious",
            parameters: {},
          },
          {
            name: "DetectRaptor.Windows.Detection.LolDriversVulnerable",
            parameters: {},
          },
          {
            name: "DetectRaptor.Windows.Detection.MFT",
            parameters: {},
          },
          {
            name: "DetectRaptor.Windows.Detection.MFT.Erasing.Tools",
            parameters: {},
          },
          {
            name: "DetectRaptor.Windows.Detection.NamedPipes",
            parameters: {},
          },
          {
            name: "DetectRaptor.Windows.Detection.Powershell.ISEAutoSave",
            parameters: {},
          },
          {
            name: "DetectRaptor.Windows.Detection.Powershell.PSReadline",
            parameters: {},
          },
          {
            name: "DetectRaptor.Windows.Detection.Webhistory",
            parameters: {},
          },
          {
            name: "DetectRaptor.Windows.Detection.YaraProcessWin",
            parameters: {},
          },
          {
            name: "DetectRaptor.Windows.Detection.ZoneIdentifier",
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

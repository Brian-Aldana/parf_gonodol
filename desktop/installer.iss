; Inno Setup Script para Parf Gonodol (Windows Installer)
[Setup]
AppId={{C78F9B60-7A0F-4B1C-8D15-18A7D7E69201}
AppName=Parf Gonodol
AppVersion=1.0.2
AppPublisher=Brian Aldana
AppPublisherURL=https://github.com/Brian-Aldana/parf_gonodol
AppSupportURL=https://github.com/Brian-Aldana/parf_gonodol
AppUpdatesURL=https://github.com/Brian-Aldana/parf_gonodol/releases
DefaultDirName={autopf}\Parf Gonodol
DisableProgramGroupPage=yes
OutputDir=dist-installer
OutputBaseFilename=Parf-Gonodol-Setup
SetupIconFile=desktop\icon.ico
Compression=lzma
SolidCompression=yes
WizardStyle=modern

[Languages]
Name: "spanish"; MessagesFile: "compiler:Languages\Spanish.isl"
Name: "english"; MessagesFile: "compiler:Default.isl"

[Tasks]
Name: "desktopicon"; Description: "{cm:CreateDesktopIcon}"; GroupDescription: "{cm:AdditionalIcons}"

[Files]
Source: "dist\Parf-Gonodol\*"; DestDir: "{app}"; Flags: ignoreversion recursesubdirs createallsubdirs

[Icons]
Name: "{autoprograms}\Parf Gonodol"; Filename: "{app}\Parf-Gonodol.exe"; IconFilename: "{app}\desktop\icon.ico"
Name: "{autodesktop}\Parf Gonodol"; Filename: "{app}\Parf-Gonodol.exe"; IconFilename: "{app}\desktop\icon.ico"; Tasks: desktopicon

[Run]
Filename: "{app}\Parf-Gonodol.exe"; Description: "{cm:LaunchProgram,Parf Gonodol}"; Flags: nowait postinstall skipifsilent

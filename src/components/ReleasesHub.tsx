import React, { useState, useEffect } from 'react';
import { 
  Tag, 
  Package, 
  ExternalLink, 
  Copy, 
  Check, 
  Download, 
  Terminal, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  ArrowUpRight, 
  Box, 
  GitBranch,
  ShieldCheck,
  FileCode2,
  Workflow
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext.tsx';

interface ReleaseInfoResponse {
  repo: {
    owner: string;
    repoName: string;
    fullName: string;
    url: string;
    newReleaseUrl: string;
    packagesUrl: string;
  };
  suggestedRelease: {
    tag: string;
    title: string;
    body: string;
    prerelease: boolean;
  };
  packageInfo: {
    packageName: string;
    version: string;
    registry: string;
    scope: string;
    installCommand: string;
    publishCommand: string;
  };
  workflows: {
    releaseWorkflowPath: string;
    publishPackageWorkflowPath: string;
  };
}

export const ReleasesHub: React.FC = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [activeSection, setActiveSection] = useState<'releases' | 'packages'>('releases');
  const [info, setInfo] = useState<ReleaseInfoResponse | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [tagInput, setTagInput] = useState<string>('v1.0.0');
  const [titleInput, setTitleInput] = useState<string>('ChatRot v1.0.0 - Production Chatbot Platform');
  const [releaseNotes, setReleaseNotes] = useState<string>('');

  useEffect(() => {
    fetch('/api/v1/release-info')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setInfo(data);
          setTagInput(data.suggestedRelease.tag);
          setTitleInput(data.suggestedRelease.title);
          setReleaseNotes(data.suggestedRelease.body);
        }
      })
      .catch((err) => console.error('Failed to load release info:', err));
  }, []);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleDownloadFile = (filename: string, content: string) => {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  const releaseYmlSample = `name: Release & Asset Distribution
on:
  push:
    tags: ['v*']
  workflow_dispatch:
permissions:
  contents: write
  packages: write
jobs:
  build-and-release:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npm run build
      - name: Create Release
        uses: softprops/action-gh-release@v2
        with:
          tag_name: \${{ github.ref_name }}
          name: "ChatRot Release \${{ github.ref_name }}"
          draft: false`;

  const publishPackageYmlSample = `name: Publish to GitHub Packages
on:
  release:
    types: [published]
  workflow_dispatch:
permissions:
  contents: read
  packages: write
jobs:
  publish-npm:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          registry-url: 'https://npm.pkg.github.com'
          scope: '@shiroonigami23-ui'
      - run: npm ci
      - run: npm run build
      - run: npm publish --access public
        env:
          NODE_AUTH_TOKEN: \${{ secrets.GITHUB_TOKEN }}`;

  const npmrcSample = `@shiroonigami23-ui:registry=https://npm.pkg.github.com\n//npm.pkg.github.com/:_authToken=\${GITHUB_TOKEN}`;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className={`p-6 rounded-2xl border transition-colors shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 ${
        isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-slate-200/50'
      }`}>
        <div>
          <div className="flex items-center space-x-2 text-indigo-500 text-xs font-mono mb-1 font-semibold">
            <Package className="w-4 h-4" />
            <span>GITHUB REPOSITORY DISTRIBUTION</span>
          </div>
          <h2 className={`text-xl font-bold flex items-center space-x-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
            <span>Releases &amp; Packages Manager</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 font-mono font-medium">
              Ready to Publish
            </span>
          </h2>
          <p className={`text-xs sm:text-sm mt-1 max-w-2xl ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Configure your GitHub Releases and publish npm packages to GitHub Packages registry for <code className="text-indigo-400 font-mono font-bold">shiroonigami23-ui/Chat-Rot</code>.
          </p>
        </div>

        {/* Section Toggle */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveSection('releases')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center space-x-2 transition-all ${
              activeSection === 'releases'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25'
                : isDark ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Tag className="w-4 h-4" />
            <span>1. GitHub Releases</span>
          </button>

          <button
            onClick={() => setActiveSection('packages')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center space-x-2 transition-all ${
              activeSection === 'packages'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25'
                : isDark ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Box className="w-4 h-4" />
            <span>2. GitHub Packages</span>
          </button>
        </div>
      </div>

      {/* SECTION 1: RELEASES */}
      {activeSection === 'releases' && (
        <div className="space-y-6">
          {/* Quick Guide Card */}
          <div className={`p-5 rounded-2xl border transition-colors ${
            isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
          }`}>
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <h3 className={`text-base font-bold flex items-center space-x-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  <Tag className="w-5 h-5 text-indigo-500" />
                  <span>Publish Release {tagInput} to GitHub</span>
                </h3>
                <p className={`text-xs mt-1 max-w-2xl ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  This will publish your first official release on GitHub, activating the <strong className={isDark ? 'text-white' : 'text-slate-900'}>&quot;Releases&quot;</strong> section in your repository sidebar.
                </p>
              </div>

              <a
                href={info?.repo.newReleaseUrl || 'https://github.com/shiroonigami23-ui/Chat-Rot/releases/new'}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center space-x-2 transition-all shadow-md shadow-emerald-600/20"
              >
                <span>Open GitHub &quot;Create a new release&quot;</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5">
              {/* Method A: Direct Web UI (Quickest) */}
              <div className={`p-4 rounded-xl border ${
                isDark ? 'bg-slate-950 border-slate-800/80' : 'bg-slate-50 border-slate-200'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold font-mono text-indigo-400 flex items-center space-x-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>METHOD A: VIA GITHUB WEB (30 SECONDS)</span>
                  </span>
                </div>
                <ol className={`space-y-2 text-xs list-decimal list-inside ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                  <li>
                    Click <strong className="text-indigo-400">Open GitHub &quot;Create a new release&quot;</strong> above
                  </li>
                  <li>
                    In <strong>Choose a tag</strong>, type <code className="px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400 font-mono">{tagInput}</code> and click <em>Create new tag: {tagInput}</em>
                  </li>
                  <li>
                    In <strong>Release title</strong>, enter <code className="px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400 font-mono">{titleInput}</code>
                  </li>
                  <li>
                    In the description box, paste the pre-generated Release Notes below
                  </li>
                  <li>
                    Click the green <strong>Publish release</strong> button!
                  </li>
                </ol>
              </div>

              {/* Method B: Via Git CLI */}
              <div className={`p-4 rounded-xl border ${
                isDark ? 'bg-slate-950 border-slate-800/80' : 'bg-slate-50 border-slate-200'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold font-mono text-emerald-400 flex items-center space-x-1.5">
                    <Terminal className="w-3.5 h-3.5" />
                    <span>METHOD B: VIA GIT TAG (AUTOMATED CI)</span>
                  </span>
                  <button
                    onClick={() => handleCopy(`git tag -a ${tagInput} -m "${titleInput}"\ngit push origin ${tagInput}`, 'git-tag')}
                    className="text-[11px] font-mono text-slate-400 hover:text-white flex items-center space-x-1"
                  >
                    {copiedKey === 'git-tag' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey === 'git-tag' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <pre className={`p-2.5 rounded-lg font-mono text-xs overflow-x-auto ${
                  isDark ? 'bg-slate-900 text-slate-200' : 'bg-slate-200 text-slate-800'
                }`}>
                  {`# Tag this commit and trigger .github/workflows/release.yml:\ngit tag -a ${tagInput} -m "${titleInput}"\ngit push origin ${tagInput}`}
                </pre>
                <p className={`text-[11px] mt-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Pushing this tag will execute <code className="text-indigo-400 font-mono">.github/workflows/release.yml</code> which builds the app and automatically creates the release with attached assets.
                </p>
              </div>
            </div>
          </div>

          {/* Release Notes Preview & Editor */}
          <div className={`p-5 rounded-2xl border transition-colors ${
            isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
          }`}>
            <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
              <div className="flex items-center space-x-2">
                <FileCode2 className="w-4 h-4 text-indigo-400" />
                <h4 className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Pre-Generated Release Notes (Extracted from CHANGELOG.md)
                </h4>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleCopy(releaseNotes, 'release-notes')}
                  className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center space-x-1.5 transition-colors shadow-sm"
                >
                  {copiedKey === 'release-notes' ? <Check className="w-3.5 h-3.5 text-white" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey === 'release-notes' ? 'Copied to Clipboard!' : 'Copy Release Notes'}</span>
                </button>

                <button
                  onClick={() => handleDownloadFile('RELEASE_NOTES.md', releaseNotes)}
                  className={`px-3 py-1.5 rounded-lg border text-xs font-semibold flex items-center space-x-1.5 transition-colors ${
                    isDark ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700' : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
                  }`}
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download .md</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
              <div>
                <label className={`block text-[11px] font-mono font-semibold mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  Target Tag
                </label>
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  className={`w-full px-3 py-1.5 rounded-lg border text-xs font-mono focus:outline-none focus:border-indigo-500 ${
                    isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                />
              </div>

              <div>
                <label className={`block text-[11px] font-mono font-semibold mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  Release Title
                </label>
                <input
                  type="text"
                  value={titleInput}
                  onChange={(e) => setTitleInput(e.target.value)}
                  className={`w-full px-3 py-1.5 rounded-lg border text-xs font-mono focus:outline-none focus:border-indigo-500 ${
                    isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                />
              </div>
            </div>

            <textarea
              rows={8}
              value={releaseNotes}
              onChange={(e) => setReleaseNotes(e.target.value)}
              className={`w-full p-3 rounded-xl border text-xs font-mono leading-relaxed focus:outline-none focus:border-indigo-500 ${
                isDark ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-slate-50 border-slate-300 text-slate-800'
              }`}
            />
          </div>

          {/* Workflow Inspection */}
          <div className={`p-5 rounded-2xl border transition-colors ${
            isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
          }`}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <Workflow className="w-4 h-4 text-emerald-400" />
                <h4 className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Automated GitHub Workflow: <code className="text-indigo-400 font-mono">.github/workflows/release.yml</code>
                </h4>
              </div>

              <button
                onClick={() => handleDownloadFile('release.yml', releaseYmlSample)}
                className={`px-2.5 py-1 rounded-lg border text-[11px] font-mono flex items-center space-x-1.5 transition-colors ${
                  isDark ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700' : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
                }`}
              >
                <Download className="w-3 h-3" />
                <span>Download release.yml</span>
              </button>
            </div>
            <pre className={`p-3 rounded-xl font-mono text-[11px] overflow-x-auto max-h-48 ${
              isDark ? 'bg-slate-950 text-slate-300 border border-slate-800' : 'bg-slate-50 text-slate-800 border border-slate-200'
            }`}>
              {releaseYmlSample}
            </pre>
          </div>
        </div>
      )}

      {/* SECTION 2: PACKAGES */}
      {activeSection === 'packages' && (
        <div className="space-y-6">
          {/* Quick Guide Card */}
          <div className={`p-5 rounded-2xl border transition-colors ${
            isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
          }`}>
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <h3 className={`text-base font-bold flex items-center space-x-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  <Box className="w-5 h-5 text-indigo-500" />
                  <span>Publish Package: <code className="text-indigo-400 font-mono">@shiroonigami23-ui/chat-rot</code></span>
                </h3>
                <p className={`text-xs mt-1 max-w-2xl ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Publishing an npm package directly into GitHub Packages allows team members and external developers to install your chatbot platform via <code className="text-indigo-400 font-mono">npm install @shiroonigami23-ui/chat-rot</code>.
                </p>
              </div>

              <a
                href={info?.repo.packagesUrl || 'https://github.com/shiroonigami23-ui/Chat-Rot/packages'}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center space-x-2 transition-all shadow-md shadow-indigo-600/20"
              >
                <span>View GitHub Packages Tab</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5">
              {/* Option 1: Automated via Workflow */}
              <div className={`p-4 rounded-xl border ${
                isDark ? 'bg-slate-950 border-slate-800/80' : 'bg-slate-50 border-slate-200'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold font-mono text-indigo-400 flex items-center space-x-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>METHOD 1: AUTOMATED GITHUB ACTION</span>
                  </span>
                </div>
                <p className={`text-xs leading-relaxed mb-3 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                  We created <code className="text-indigo-400 font-mono">.github/workflows/publish-package.yml</code>. Whenever you create a release on GitHub, this action automatically packages the repo and publishes it to GitHub Packages using the built-in <code className="text-indigo-400 font-mono">GITHUB_TOKEN</code>!
                </p>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleDownloadFile('publish-package.yml', publishPackageYmlSample)}
                    className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center space-x-1.5 transition-colors shadow-sm"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download publish-package.yml</span>
                  </button>
                </div>
              </div>

              {/* Option 2: CLI Publish */}
              <div className={`p-4 rounded-xl border ${
                isDark ? 'bg-slate-950 border-slate-800/80' : 'bg-slate-50 border-slate-200'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold font-mono text-emerald-400 flex items-center space-x-1.5">
                    <Terminal className="w-3.5 h-3.5" />
                    <span>METHOD 2: LOCAL TERMINAL PUBLISH</span>
                  </span>
                  <button
                    onClick={() => handleCopy(`npm config set //npm.pkg.github.com/:_authToken YOUR_GITHUB_TOKEN\nnpm publish --access public`, 'cli-pub')}
                    className="text-[11px] font-mono text-slate-400 hover:text-white flex items-center space-x-1"
                  >
                    {copiedKey === 'cli-pub' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey === 'cli-pub' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <pre className={`p-2.5 rounded-lg font-mono text-xs overflow-x-auto ${
                  isDark ? 'bg-slate-900 text-slate-200' : 'bg-slate-200 text-slate-800'
                }`}>
                  {`# 1. Authenticate with GitHub Packages token:\nnpm config set //npm.pkg.github.com/:_authToken $GITHUB_TOKEN\n\n# 2. Publish package:\nnpm publish --access public`}
                </pre>
              </div>
            </div>
          </div>

          {/* Package Configuration Details */}
          <div className={`p-5 rounded-2xl border transition-colors ${
            isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
          }`}>
            <h4 className={`text-sm font-bold mb-3 flex items-center space-x-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Configured Package Metadata (in package.json)</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
              <div className={`p-3 rounded-xl border ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                <div className={`text-[11px] font-mono ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Package Name</div>
                <div className="text-xs font-mono font-bold text-indigo-400 mt-1">@shiroonigami23-ui/chat-rot</div>
              </div>
              <div className={`p-3 rounded-xl border ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                <div className={`text-[11px] font-mono ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Target Registry</div>
                <div className="text-xs font-mono font-bold text-emerald-400 mt-1">https://npm.pkg.github.com</div>
              </div>
              <div className={`p-3 rounded-xl border ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                <div className={`text-[11px] font-mono ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Version</div>
                <div className="text-xs font-mono font-bold text-amber-400 mt-1">1.0.0</div>
              </div>
            </div>

            {/* How others install it */}
            <div className="space-y-3">
              <div>
                <label className={`block text-xs font-semibold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  How Other Developers Install Your Published Package:
                </label>
                <div className="relative">
                  <pre className={`p-3 rounded-xl font-mono text-xs overflow-x-auto ${
                    isDark ? 'bg-slate-950 text-slate-200 border border-slate-800' : 'bg-slate-100 text-slate-900 border border-slate-200'
                  }`}>
                    npm install @shiroonigami23-ui/chat-rot
                  </pre>
                  <button
                    onClick={() => handleCopy('npm install @shiroonigami23-ui/chat-rot', 'npm-install')}
                    className="absolute right-3 top-3 text-slate-400 hover:text-white"
                  >
                    {copiedKey === 'npm-install' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className={`block text-xs font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    Required Developer <code className="text-indigo-400 font-mono">.npmrc</code> configuration:
                  </label>
                  <button
                    onClick={() => handleDownloadFile('.npmrc', npmrcSample)}
                    className="text-[11px] font-mono text-indigo-400 hover:underline flex items-center space-x-1"
                  >
                    <Download className="w-3 h-3" />
                    <span>Download .npmrc</span>
                  </button>
                </div>
                <pre className={`p-3 rounded-xl font-mono text-xs overflow-x-auto ${
                  isDark ? 'bg-slate-950 text-slate-200 border border-slate-800' : 'bg-slate-100 text-slate-900 border border-slate-200'
                }`}>
                  {npmrcSample}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

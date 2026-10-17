#!/usr/bin/env node
/**
 * @license
 * SPDX-License-Identifier: MIT
 * OmniCore Smart Changelog Action Bot Generator
 * 
 * Analyzes Git commits, categorizes changes (Features, Fixes, Docs, Enhancements),
 * updates CHANGELOG.md under [Unreleased] or current release,
 * and rigorously enforces 3 layers of recursion guards to prevent infinite CI loops.
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../');
const changelogPath = path.join(rootDir, 'CHANGELOG.md');

/**
 * 3-Layer Anti-Recursion Shield
 */
export function checkRecursionGuards(commitMessage, authorName, changedFiles = []) {
  // Guard Layer 1: [skip ci] or [auto-changelog] in commit message
  const lowerMsg = (commitMessage || '').toLowerCase();
  if (lowerMsg.includes('[skip ci]') || lowerMsg.includes('[ci skip]') || lowerMsg.includes('[auto-changelog]')) {
    return {
      allowed: false,
      reason: 'Recursion Guard Layer 1: Commit contains [skip ci] / [auto-changelog] flag.',
    };
  }

  // Guard Layer 2: Bot identity check
  const lowerAuthor = (authorName || '').toLowerCase();
  if (
    lowerAuthor.includes('github-actions[bot]') ||
    lowerAuthor.includes('github-actions') ||
    lowerAuthor.includes('action-bot') ||
    lowerAuthor.includes('bot@')
  ) {
    return {
      allowed: false,
      reason: 'Recursion Guard Layer 2: Commit author matches automated bot identity.',
    };
  }

  // Guard Layer 3: Diff check - if only CHANGELOG.md was touched, abort
  if (changedFiles.length === 1 && changedFiles[0].includes('CHANGELOG.md')) {
    return {
      allowed: false,
      reason: 'Recursion Guard Layer 3: Only CHANGELOG.md was modified in this commit. Suppressing self-triggering loop.',
    };
  }

  return { allowed: true, reason: 'Passed all 3 anti-recursion guards.' };
}

/**
 * Classifies commit messages into Keep a Changelog categories
 */
export function classifyCommit(message, files = []) {
  const cleanMsg = message.trim();
  const lower = cleanMsg.toLowerCase();

  let category = 'Changed';
  let cleanTitle = cleanMsg;

  // Conventional commit prefixes
  if (/^feat(\(.*\))?:/i.test(cleanMsg)) {
    category = 'Added';
    cleanTitle = cleanMsg.replace(/^feat(\(.*\))?:\s*/i, '');
  } else if (/^fix(\(.*\))?:/i.test(cleanMsg)) {
    category = 'Fixed';
    cleanTitle = cleanMsg.replace(/^fix(\(.*\))?:\s*/i, '');
  } else if (/^docs(\(.*\))?:/i.test(cleanMsg)) {
    category = 'Documentation';
    cleanTitle = cleanMsg.replace(/^docs(\(.*\))?:\s*/i, '');
  } else if (/^(perf|enhance|ui|style)(\(.*\))?:/i.test(cleanMsg)) {
    category = 'Enhanced';
    cleanTitle = cleanMsg.replace(/^(perf|enhance|ui|style)(\(.*\))?:\s*/i, '');
  } else if (/^refactor(\(.*\))?:/i.test(cleanMsg)) {
    category = 'Changed';
    cleanTitle = cleanMsg.replace(/^refactor(\(.*\))?:\s*/i, '');
  } else if (/^sec(urity)?(\(.*\))?:/i.test(cleanMsg)) {
    category = 'Security';
    cleanTitle = cleanMsg.replace(/^sec(urity)?(\(.*\))?:\s*/i, '');
  } else {
    // Infer category from changed files if not conventional
    if (files.some(f => f.includes('docs/') || f.endsWith('.md'))) {
      category = 'Documentation';
    } else if (files.some(f => f.includes('adapter') || f.includes('component') || f.includes('route'))) {
      category = 'Added';
    }
  }

  // Capitalize first letter of title
  cleanTitle = cleanTitle.charAt(0).toUpperCase() + cleanTitle.slice(1);

  return {
    category,
    title: cleanTitle,
    original: cleanMsg,
  };
}

/**
 * Updates CHANGELOG.md with a new entry under [Unreleased]
 */
export function appendToChangelog(classifiedItem) {
  if (!fs.existsSync(changelogPath)) {
    console.error('CHANGELOG.md not found at', changelogPath);
    return false;
  }

  let content = fs.readFileSync(changelogPath, 'utf8');

  // Prevent duplicate entry
  if (content.includes(classifiedItem.title)) {
    console.log(`[Changelog Bot] Entry already exists: "${classifiedItem.title}". Skipping duplicate.`);
    return false;
  }

  const sectionHeader = `### ${classifiedItem.category}`;
  const bullet = `- ${classifiedItem.title}`;

  if (content.includes('## [Unreleased]')) {
    // Check if category exists under [Unreleased]
    const unreleasedIndex = content.indexOf('## [Unreleased]');
    const nextReleaseIndex = content.indexOf('## [', unreleasedIndex + 15);
    const unreleasedSection = nextReleaseIndex !== -1 
      ? content.substring(unreleasedIndex, nextReleaseIndex) 
      : content.substring(unreleasedIndex);

    if (unreleasedSection.includes(sectionHeader)) {
      // Append under existing category header
      const headerPos = content.indexOf(sectionHeader, unreleasedIndex);
      const insertPos = headerPos + sectionHeader.length;
      content = content.slice(0, insertPos) + `\n${bullet}` + content.slice(insertPos);
    } else {
      // Add new category header under [Unreleased]
      const insertPos = unreleasedIndex + '## [Unreleased]'.length;
      content = content.slice(0, insertPos) + `\n\n${sectionHeader}\n${bullet}` + content.slice(insertPos);
    }
  } else {
    // Prepend [Unreleased] section
    const titleIndex = content.indexOf('# Changelog');
    const insertPos = content.indexOf('\n', titleIndex) + 1;
    content = content.slice(0, insertPos) + `\n## [Unreleased]\n\n${sectionHeader}\n${bullet}\n\n---\n` + content.slice(insertPos);
  }

  fs.writeFileSync(changelogPath, content, 'utf8');
  console.log(`[Changelog Bot] Successfully updated CHANGELOG.md with: [${classifiedItem.category}] ${classifiedItem.title}`);
  return true;
}

// Standalone CLI execution
if (process.argv[1] && process.argv[1].endsWith('update-changelog.js')) {
  try {
    const lastCommitMsg = execSync('git log -1 --pretty=%B', { encoding: 'utf8' }).trim();
    const lastAuthor = execSync('git log -1 --pretty=%an', { encoding: 'utf8' }).trim();
    const changedFiles = execSync('git diff-tree --no-commit-id --name-only -r HEAD', { encoding: 'utf8' })
      .trim()
      .split('\n')
      .filter(Boolean);

    console.log(`[Changelog Bot] Inspecting commit: "${lastCommitMsg}" by ${lastAuthor}`);
    const guardCheck = checkRecursionGuards(lastCommitMsg, lastAuthor, changedFiles);

    if (!guardCheck.allowed) {
      console.log(`[Changelog Bot] Recursion Guard Triggered: ${guardCheck.reason}`);
      process.exit(0);
    }

    const classified = classifyCommit(lastCommitMsg, changedFiles);
    console.log(`[Changelog Bot] Classified as: [${classified.category}] ${classified.title}`);
    appendToChangelog(classified);
  } catch (err) {
    console.log('[Changelog Bot] Git query warning (simulated/dev environment):', err.message);
  }
}

import { describe, expect, it } from 'vitest';
import { en } from '@payloadcms/translations/languages/en';
import { pt } from '@payloadcms/translations/languages/pt';
import { deepMergeSimple } from '@payloadcms/translations/utilities';
import { ptPTTranslations } from './pt-PT';

const BRAZILIAN_ONLY_TERMS =
  /(?<!\p{L})(senhas?|usuári[oa]s?|vocês?|registr\p{L}*|arquivos?|salv(?:ar|o|a|os|as|ando|amento)|exclu\p{L}*|telas?|login|logout|log out|deletar|deletado)(?!\p{L})/iu;

const PLACEHOLDERS = /\{\{[^}]+\}\}|<\/?\d+>/g;

type Tree = { [key: string]: string | Tree };

const stringLeaves = (tree: Tree, path: string[] = []): [string, string][] =>
  Object.entries(tree).flatMap(([key, value]) =>
    typeof value === 'string'
      ? [[[...path, key].join(':'), value] as [string, string]]
      : stringLeaves(value, [...path, key])
  );

const placeholdersOf = (text: string): string[] =>
  [...new Set(text.match(PLACEHOLDERS) ?? [])].sort();

describe('Portuguese admin translations', () => {
  it('leaves no Brazilian-only term in the Portuguese admin strings', () => {
    const merged = deepMergeSimple(pt.translations, ptPTTranslations) as Tree;

    const offending = stringLeaves(merged)
      .filter(([, value]) => BRAZILIAN_ONLY_TERMS.test(value))
      .map(([key]) => key);

    expect(offending).toEqual([]);
  });

  it('keeps every interpolation variable and markup tag of the English source', () => {
    const english = en.translations as unknown as Record<string, Record<string, string>>;

    const mismatched = Object.entries(ptPTTranslations).flatMap(([namespace, overrides]) =>
      Object.entries(overrides as Record<string, string>)
        .filter(
          ([key, value]) =>
            placeholdersOf(value).join('|') !== placeholdersOf(english[namespace][key]).join('|')
        )
        .map(([key]) => `${namespace}:${key}`)
    );

    expect(mismatched).toEqual([]);
  });
});

# jx

[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]
[![bundle][bundle-src]][bundle-href]
[![JSDocs][jsdocs-src]][jsdocs-href]
[![License][license-src]][license-href]

Personal CLI tool

- [x] Cloen repo
- [x] Common text snippets
- [ ] ...

## Install

```bash
#pnpm
pnpm i -g @jianxing/jx
# npm
npm i -g @jianxing/jx
# yarn
yarn add -g @jianxing/jx
```

##  Usage

### Command

```bash
# jx config
jx config repoUrl=xxx # common text snippets repo url
jx config accessToken=xxx # auth account token, generate by Profile -> Settings -> Developer settings -> Personal access tokens -> Tokens(classic) or Fine-grained tokens

# jx repo
jx repo # show all common text list
jx repo <filePath> # get a file content
jx repo <filePath> -d # delete a file
jx repo <filePath> "some content" -s # put some content to file
jx repo <filePath> "some content" -sn # create a file with content
jx repo <filePath> "some content" -a # append content to a file

# jx start <repo> [owner] [ref]，owner defult is self
jx start <repo> # clone <repo>
jx start <repo> [owner] # clone <repo> of [owner]
jx start <repo> [owner] [ref] # ref is branch or tag or commitHash

```

## License

[MIT](./LICENSE) License © 2023-PRESENT [Jianxing Xu](https://github.com/jianxing-xu)

<!-- Badges -->

[npm-version-src]: https://img.shields.io/npm/v/jx?style=flat&colorA=080f12&colorB=1fa669
[npm-version-href]: https://npmjs.com/package/jx
[npm-downloads-src]: https://img.shields.io/npm/dm/jx?style=flat&colorA=080f12&colorB=1fa669
[npm-downloads-href]: https://npmjs.com/package/jx
[bundle-src]: https://img.shields.io/bundlephobia/minzip/jx?style=flat&colorA=080f12&colorB=1fa669&label=minzip
[bundle-href]: https://bundlephobia.com/result?p=jx
[license-src]: https://img.shields.io/github/license/jianxing-xu/jx.svg?style=flat&colorA=080f12&colorB=1fa669
[license-href]: https://github.com/jianxing-xu/jx/blob/main/LICENSE
[jsdocs-src]: https://img.shields.io/badge/jsdocs-reference-080f12?style=flat&colorA=080f12&colorB=1fa669
[jsdocs-href]: https://www.jsdocs.io/package/jx

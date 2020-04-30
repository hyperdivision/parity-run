# `parity-run`

> Run scripts with Parity and Naoneth

## Usage

Example script:

```js
module.exports = async function (eth) {
  console.log(await eth.getBlockByNumber('latest'))
}
```

Running it:

```sh
parity-run script.js
```

This will wait for the latest block to be within ~ 2 min of wall clock time.

## Install

```sh
npm install parity-run
```

## License

[ISC](LICENSE)

module.exports = async function (eth) {
  console.log(await eth.getBlockByNumber('latest'))
  return true
}

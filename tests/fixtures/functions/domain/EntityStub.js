export default function (data, valid = true, errors = []) {
  return {
    ...data,
    validate () {
      return { valid, errors }
    }
  }
}

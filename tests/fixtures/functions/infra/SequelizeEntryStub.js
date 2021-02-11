export default function (data) {
  return {
    ...data,
    toJSON () {
      return data
    }
  }
}

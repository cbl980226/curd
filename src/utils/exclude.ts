function exclude<M, K extends keyof M>(model: M, keys: K[]): Omit<M, K> {
  const result = Object.fromEntries(
    Object.entries(model).filter(([key]) => !keys.includes(key as K))
  ) as Omit<M, K>
  return result
}

export default exclude

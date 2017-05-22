import fs from 'fs'
import yaml from 'js-yaml'

export const operationSchema = parse('operation-schema');
export const spec1 = parse('spec1')

function parse(filename) {
  return yaml.safeLoad(fs.readFileSync(`${__dirname}/${filename}.yml`))
}
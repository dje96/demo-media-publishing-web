import { SnowTypeConfig } from "@snowplow/snowtype/types";
const config: SnowTypeConfig = {
  igluCentralSchemas: [],
  dataStructures: [],
  repositories: [],
  eventSpecificationIds: [],
  dataProductIds: ['58526f0a-c5b6-4d08-bc4f-199836217d0c', '98f633e6-ab32-43a8-8e07-0d6124da0ee7', 'ead1f30f-1234-4350-a112-02003991e391'],
  organizationId: 'b12539df-a711-42bd-bdfa-175308c55fd5',
  tracker: '@snowplow/browser-tracker',
  language: 'typescript',
  outpath: './snowtype'
}

export default config;
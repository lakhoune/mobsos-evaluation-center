import { Visualization } from './visualization.model';

/**
 * Catalog of measures
 */
export interface MeasureCatalog {
  measures: MeasureMap; // Measures of the catalog
}
/**
 * Map of measures
 */
export interface MeasureMap {
  [key: string]: Measure; // measures are identified by their name
}
/**
 * Success Measure
 */
export interface Measure {
  name: string;
}

export class Measure implements Measure {
  constructor(
    public name: string,
    public queries: SQLQuery[],
    public visualization: Visualization,
    public tags: string[],
    public description?: string,
  ) {}

  static fromXml(xml: Element): Measure {
    const measureName = xml.getAttribute('name');
    const queryNodes = Array.from(xml.getElementsByTagName('query'));
    let description = '';
    if (xml.getElementsByTagName('description')?.length > 0) {
      description = xml
        .getElementsByTagName('description')[0]
        .textContent.trim();
    }

    const queries: SQLQuery[] = [];
    for (const queryNode of queryNodes) {
      queries.push(SQLQuery.fromXml(queryNode));
    }
    const visualizationNode = Array.from(
      xml.getElementsByTagName('visualization'),
    )[0];
    const visualization = Visualization.fromXml(visualizationNode);
    const tagsCsv = xml.getAttribute('tags');
    let tags: string[] = [];
    if (tagsCsv) {
      tags = tagsCsv.split(';');
    }
    return new Measure(
      measureName,
      queries,
      visualization,
      tags,
      description,
    );
  }
  /**
   * Transforms a JSON representation of the measure into JavaScript object.
   * The  JSON object is missing the transformation function toXML() thus we transform it to later transform it into XML format
   *
   * @param obj JSON representation of the Measure
   * @returns JavaScript object representation
   */
  public static fromJSON(obj: Measure): Measure {
    if (!obj) return null;
    const queries: SQLQuery[] = [];
    for (const objQuery of obj.queries) {
      queries.push(SQLQuery.fromJSON(objQuery));
    }
    const visualization = Visualization.fromPlainObject(
      obj.visualization,
    );
    const description = obj.description;
    return new Measure(
      obj.name,
      queries,
      visualization,
      obj.tags,
      description,
    );
  }

  /**
   * Transforms the javascript representation into xml representation
   *
   * @returns XML element
   */
  toXml(): Element {
    const doc = document.implementation.createDocument('', '', null);
    const measure = doc.createElement('measure');
    measure.setAttribute('name', this.name);
    if (this.tags) measure.setAttribute('tags', this.tags.join(';'));
    const description = doc.createElement('description');
    description.textContent = this.description;
    measure.appendChild(description);

    for (const query of this.queries) {
      measure.appendChild(query.toXml());
    }
    if (this.visualization) {
      measure.appendChild(this.visualization.toXml());
    }

    return measure;
  }
}

export class MeasureCatalog implements MeasureCatalog {
  constructor(public measures: MeasureMap) {}

  /**
   * Parses a XML representation of th measure catalog into a JavaScript object
   *
   * @param xml xml representation of the measure catalog
   * @returns Measure catalog object
   */
  static fromXml(xml: Element): MeasureCatalog {
    const measureNodes = Array.from(
      xml.getElementsByTagName('measure'),
    );
    const measureMap: MeasureMap = {};
    for (const measureNode of measureNodes) {
      const measureName = measureNode.getAttribute('name');
      measureMap[measureName] = Measure.fromXml(measureNode);
    }
    return new MeasureCatalog(measureMap);
  }

  /**
   * Transforms an JSON representation of the measure catalog into JavaScript object.
   *
   * @param obj  JSON representation of the MeasureCatalog
   * @returns  JavaScript object representation of the MeasureCatalog
   */
  public static fromJSON(obj: MeasureCatalog): MeasureCatalog {
    try {
      if (!obj?.measures) return null;
      const measureMap: MeasureMap = {};
      for (const measureName of Object.keys(obj.measures)) {
        measureMap[measureName] = Measure.fromJSON(
          obj.measures[measureName],
        );
      }
      return new MeasureCatalog(measureMap);
    } catch (e) {
      e.printStackTrace();
      return null;
    }
  }

  /**
   * Transforms the javascript object into xml representation
   *
   * @returns XML representation of the measure catalog
   */
  toXml(): Element {
    const doc = document.implementation.createDocument('', '', null);
    const catalog = doc.createElement('Catalog');
    for (const measure of Object.values(this.measures)) {
      if (typeof measure.toXml === 'undefined') {
        catalog.appendChild(Measure.fromJSON(measure).toXml());
      } else {
        catalog.appendChild(measure.toXml());
      }
    }
    return catalog;
  }
}
/**
 * Query for a measure (onls SQL query used at the moment)
 */
export interface Query {
  name: string; // Name of the query
}

export class Query implements Query {
  constructor(public name: string) {}

  static fromXml(xml: Element): Query {
    const queryName = xml.getAttribute('name');
    return new Query(queryName);
  }

  public static fromPlainObject(obj: { name: string }): Query {
    return new Query(obj.name);
  }

  toXml(): Element {
    const doc = document.implementation.createDocument('', '', null);
    const query = doc.createElement('query');
    query.setAttribute('name', this.name);
    return query;
  }
}

export class SQLQuery extends Query {
  constructor(public override name: string, public sql: string) {
    super(name);
    this.sql = sql;
  }

  static override fromXml(xml: Element): SQLQuery {
    const queryName = xml.getAttribute('name');
    const sql = xml.innerHTML;
    return new SQLQuery(queryName, sql);
  }

  public static fromJSON(obj: {
    name: string;
    sql: string;
  }): SQLQuery {
    return new SQLQuery(obj.name, obj.sql);
  }

  override toXml(): Element {
    const doc = document.implementation.createDocument('', '', null);
    const query = doc.createElement('query');
    query.setAttribute('name', this.name);
    query.innerHTML = this.sql;
    return query;
  }
}

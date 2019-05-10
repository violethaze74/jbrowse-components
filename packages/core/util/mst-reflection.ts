/* eslint-disable no-underscore-dangle */
import {
  isOptionalType,
  isUnionType,
  isArrayType,
  isMapType,
  IAnyModelType,
  OptionalProperty,
} from 'mobx-state-tree'

/**
 * get the inner type of an MST optional or array type object
 *
 * @param {IAnyModelType} type
 * @returns {IAnyModelType}
 */
export function getSubType(
  type: IAnyModelType & OptionalProperty,
): IAnyModelType {
  let t
  if (isOptionalType(type)) {
    // @ts-ignore
    t = type._subtype || type.type
  } else if (isArrayType(type) || isMapType(type)) {
    // @ts-ignore
    t = type._subtype || type._subType || type.subType
  } else {
    throw new TypeError('unsupported mst type')
  }
  if (!t) {
    // debugger
    throw new Error('failed to get subtype')
  }
  return t
}

/**
 * get the array of
 * @param {MST Union Type obj} unionType
 * @returns {IAnyModelType[]}
 */
export function getUnionSubTypes(unionType: IAnyModelType): IAnyModelType[] {
  if (!isUnionType(unionType)) throw new TypeError('not an MST union type')
  // @ts-ignore eslint-disable-next-line no-underscore-dangle
  const t = unionType._types || unionType.types
  if (!t) {
    // debugger
    throw new Error('failed to extract subtypes from mst union')
  }
  return t
}

/**
 * get the type of one of the properties of the given MST model type
 *
 * @param {IAnyModelType} type
 * @param {string} propertyName
 * @returns {IModelType}
 */
export function getPropertyType(
  type: IAnyModelType,
  propertyName: string,
): IAnyModelType {
  const propertyType = type.properties[propertyName]
  return propertyType
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getDefaultValue(type: IAnyModelType & OptionalProperty): any {
  if (!isOptionalType(type))
    throw new TypeError('type must be an optional type')
  // @ts-ignore eslint-disable-next-line no-underscore-dangle
  return type._defaultValue || type.defaultValue
}

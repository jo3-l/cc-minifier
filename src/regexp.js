export const variableRegexp = /\$(?:[a-zA-Z]\w*)?/g;
export const variableCommaRegexp = /(\$(?:[a-zA-Z]\w*)?)\s*,\s*/g;
export const variableInitializationRegexp = /(\$(?:[a-zA-Z]\w*)?)\s*:=\s*/g;
export const variableReassignmentRegexp = /(\$(?:[a-zA-Z]\w*)?)\s*=\s*/g;

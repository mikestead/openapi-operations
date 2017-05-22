const SUPPORTED_METHODS = [
  'get',
  'put',
  'post',
  'delete',
  'options',
  'head',
  'patch'
];

export default function getOperations(spec, options) {
  options = options || {};
  applyDefaults(spec, options);

  const base = options.includeBase
    ? {
        info: spec.info,
        host: spec.host,
        securityDefinitions: spec.securityDefinitions,
        ext: getExtensions(spec)
      }
    : undefined;

  return getPaths(spec).reduce(
    (ops, pathInfo) =>
      ops.concat(getPathOperations(pathInfo, spec, base, options)),
    []
  );
}

function applyDefaults(spec, options) {
  if (!spec.accepts) spec.accepts = [];
  if (!spec.contentTypes) spec.contentTypes = [];
  if (!spec.basePath) spec.basePath = '/';
  if (!options.mode) options.mode = 'server';
}

function getPaths(spec) {
  return Object.keys(spec.paths || {}).map(path =>
    copy({ path }, spec.paths[path]));
}

function getPathOperations(pathInfo, spec, base, options) {
  const fullPath = getFullPath(spec, pathInfo);
  const commonPathInfo = {
    base,
    pathExt: getExtensions(pathInfo),
    basePath: spec.basePath,
    path: pathInfo.path,
    fullPath,
    url: getUrl(spec, fullPath, options)
  };

  return Object.keys(pathInfo)
    .filter(key => ~SUPPORTED_METHODS.indexOf(key))
    .map(method =>
      getPathOperation(spec, commonPathInfo, pathInfo, method, options));
}

function getFullPath(spec, pathInfo) {
  const base = spec.basePath === '/' ? '' : spec.basePath;
  return `${base}${pathInfo.path}`;
}

function getUrl(spec, fullPath, options) {
  const host = spec.host || options.host;
  if (!host) return fullPath;
  return `${host}${fullPath}`;
}

function getExtensions(obj, wipe) {
  const exts = Object.keys(obj).filter(id => id.indexOf('x-') === 0);
  if (!exts.length) return undefined;
  return exts.reduce(
    (ext, id) => {
      ext[id.slice(2)] = obj[id];
      if (wipe) delete obj[id];
      return ext;
    },
    {}
  );
}

function getPathOperation(spec, commonPathInfo, pathInfo, method, options) {
  const opInfo = pathInfo[method];
  const parameters = getParameters(pathInfo, opInfo);
  const op = copy(commonPathInfo, opInfo, { parameters, method });

  if (!op.tags) op.tags = [];
  if (!op.parameters) op.parameters = [];

  op.id = getId(op);
  op.group = getGroupName(op);
  op.ext = getExtensions(op, true);
  op.responses = getResponses(op);
  op.schemes = op.schemes || spec.schemes;

  if (options.mode === 'client') {
    op.contentTypes = op.consumes || spec.consumes;
    op.accepts = op.produces || spec.produces;
    delete op.consumes;
    delete op.produces;
  } else {
    op.consumes = op.consumes || spec.consumes;
    op.produces = op.produces || spec.produces;
  }
  if (op.security) op.security = getSecurity(op);

  return op;
}

function getParameters(pathInfo, opInfo) {
  if (!pathInfo.parameters) return opInfo.parameters || [];
  if (!opInfo.parameters) return pathInfo.parameters;

  const params = opInfo.parameters.slice();
  pathInfo.parameters.forEach(p => {
    if (!params.some(p2 => p.name === p2.name && p.in === p2.in)) {
      params.push(p);
    }
  });
  return params;
}

function getId(op) {
  let id = op.operationId;
  // if there's no explicit operationId, create one based on the method and path
  if (!id) {
    id = (method + pathInfo.path)
      .replace(/[\/{(?\/{)]([^{.])/g, (_, m) => m.toUpperCase())
      .replace(/[\/}]/g, '');
  }
  delete op.operationId;
  return id || 'unknown';
}

function getGroupName(op) {
  return (op.tags[0] || 'default')
    .replace(/[^$_a-z0-9]+/gi, '')
    .replace(/^[0-9]+/m, '');
}

function getResponses(op) {
  return Object.keys(op.responses || {}).map(code => {
    const info = op.responses[code];
    info.code = code;
    return info;
  });
}

function getConsumes(spec, op) {
  return op.consumes || spec.consumes;
}

function getSecurity(op) {
  if (!op.security || !op.security.length) return;

  return op.security.map(def => {
    const id = Object.keys(def)[0];
    const scopes = def[id].length ? def[id] : undefined;
    return { id, scopes };
  });
}

function getSecurityDefinitions(spec, op) {
  return op.security.reduce(
    (defs, sec) => {
      defs[sec.id] = spec.securityDefinitions[sec.id];
      return defs;
    },
    {}
  );
}

function copy() {
  const src = {};
  for (let i = 0; i < arguments.length; i++) {
    const obj = arguments[i];
    const keys = Object.keys(obj);
    for (let j = 0; j < keys.length; j++) {
      const key = keys[j];
      src[key] = obj[key];
    }
  }
  return src;
}

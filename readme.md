
# AKB-TS

原[akb](https://github.com/searchfe/akb)是nodejs框架，但不支持TS，且多年未维护，所以重新实现一套支持原akb目录规范的nodejs框架

## 开发

```
npm i --registry=https://registry.npm.taobao.org
npm run dev
```

## 构建

```
npm run build
```

## 依赖

* https://github.com/winstonjs/winston
* https://github.com/winstonjs/winston-daily-rotate-file
* https://www.npmjs.com/package/cron
* https://github.com/koajs/session
* https://www.npmjs.com/package/path-to-regexp


## types

* @koa/router https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/types/koa__router

## 关于ts-node 开发问题
一般启用了进程，监听ts变动用tsc编译成js
然后再启用了进程，监听js变动并执行

但为开发方便，开始时采用ts-node执行ts文件，默认ts-node会加载tsconfig.json，但是不会读取files, include, or exclude字段，需要--files启用， 见 https://www.npmjs.com/package/ts-node



export interface FolderInfo {
  // 所在的 alist 服务器域名
  server: string;
  // 请求 alist 的 path
  path: string;
  files?: CustomFileInfo[];
}

// 添加额外的虚拟文件，或者配置现有文件的属性。要是添加虚拟文件夹的话，要在那个目录里面创建一个文件夹，在它里面创建 folder.yaml
export interface CustomFileInfo {
  name: string;
  title?: string;
  url?: string;
  isFolder?: boolean;
  size?: number;
}

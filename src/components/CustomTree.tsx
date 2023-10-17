/* eslint-disable react-hooks/exhaustive-deps */
import { Input, Space, Switch, Tree } from 'antd';
import type { DataNode } from 'antd/es/tree';
import type { CSSProperties } from 'react';
import React, { useEffect, useState } from 'react';

const allKeys: any = (data: any[]) =>
  data.map((item) => (item.children ? allKeys(item.children) : item.id));
const getParentKey = (key: React.Key, tree: any[]): React.Key => {
  let parentKey: React.Key;
  for (let i = 0; i < tree.length; i++) {
    const node = tree[i];
    if (node.children) {
      if (node.children.some((item: { parent_id: React.Key }) => item.parent_id === key)) {
        parentKey = node.id;
      } else if (getParentKey(key, node.children)) {
        parentKey = getParentKey(key, node.children);
      }
    }
  }
  return parentKey!;
};
const flatTheTree = (tree: any[]): any[] => {
  const arr: any[] = [];
  if (!tree) return arr;
  tree.forEach((item) => {
    const tmp = { ...item };
    if (tmp.children) {
      const children = tmp.children;
      delete tmp.children;
      arr.push(tmp);
      const childs = flatTheTree(children);
      childs?.forEach((child) => arr.push(child));
    } else {
      arr.push(tmp);
    }
  });
  return arr;
};

/**
 * 自定义树形组件
 * ADD.JENA.20221129
 * @author JENA
 */
export default (props: {
  originalTreeData: DataNode[];
  defaultChecked?: React.Key[];
  defaultSelected?: React.Key[];
  showToolbar?: boolean;
  checkable?: boolean;
  onChecked?: (keys: React.Key[]) => void;
  onSelected?: (keys: React.Key[]) => void;
  treeStyle?: CSSProperties;
}) => {
  const [treeData, setTreeData] = useState<DataNode[]>([]);
  const [expandedKeys, setExpandedKeys] = useState<React.Key[]>([]);
  const [checkedKeys, setCheckedKeys] = useState<React.Key[]>([]);
  const [selectedKeys, setSelectedKeys] = useState<React.Key[]>([]);
  const [checkStrictly, setCheckStrictly] = useState<boolean>(false);
  const [searchValue, setSearchValue] = useState<string>('');
  const [reload, setReload] = useState<number>(Math.random());

  useEffect(() => {
    setTreeData(props.originalTreeData);
    setCheckedKeys(props?.defaultChecked ?? []);
    setSelectedKeys(props?.defaultSelected ?? []);
    return () => {
      setTreeData([]);
      setCheckedKeys([]);
      setSelectedKeys([]);
    };
  }, [props.originalTreeData, reload]);

  useEffect(() => {
    const loop = (data: any[]): any[] =>
      data.map((item) => {
        const strTitle = item.label.toString();
        const index = strTitle.indexOf(searchValue);
        const beforeStr = strTitle.substring(0, index);
        const afterStr = strTitle.slice(index + searchValue.length);
        const title =
          index > -1 ? (
            <span>
              {beforeStr}
              <span className="site-tree-search-value">{searchValue}</span>
              {afterStr}
            </span>
          ) : (
            <span>{strTitle}</span>
          );
        if (item.children) {
          return { label: title, id: item.id, children: loop(item.children) };
        }

        return {
          label: title,
          id: item.id,
        };
      });

    setTreeData(loop(props.originalTreeData));
    return ()=>{
      setTreeData([]);
    }
  }, [searchValue]);

  return (
    <div className="tree-search-wrapper" style={{ minWidth: 200 }}>
      {(props.showToolbar ?? true) && (
        <Space size={20} style={{ marginBottom: 15, marginTop: 4, width: '100%' }}>
          <Switch
            checkedChildren="全部展开"
            unCheckedChildren="全部折叠"
            defaultChecked={false}
            onChange={(checked: boolean) => {
              if (checked) {
                setExpandedKeys([...allKeys(treeData).flat(3)]);
              } else {
                setExpandedKeys([]);
              }
            }}
          />
          <Switch
            checkedChildren="全部选择"
            unCheckedChildren="全不选择"
            defaultChecked={false}
            onChange={(checked: boolean) => {
              let keys: any[] = [];
              if (checked) {
                keys = [...allKeys(treeData).flat(3)];
              }
              setCheckedKeys(keys);
              props?.onChecked?.(keys);
            }}
          />
          <Switch
            checkedChildren="开启父子级联动"
            unCheckedChildren="关闭父子级联动"
            defaultChecked={!checkStrictly}
            onChange={(checked: boolean) => {
              setCheckStrictly(!checked);
              setReload(Math.random());
            }}
          />
        </Space>
      )}
      <Input.Search
        placeholder="键入关键词搜索"
        allowClear={true}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
          const { value } = e.target;
          const newExpandedKeys = value
            ? flatTheTree(props.originalTreeData)
                .map((item: any) => {
                  if (item.label.indexOf(value) > -1) {
                    return getParentKey(item.id, props.originalTreeData);
                  }
                  return null;
                })
                .filter((item, i, self) => item && self.indexOf(item) === i)
            : [];
          setExpandedKeys(newExpandedKeys as React.Key[]);
          setSearchValue(value);
        }}
      />
      <Tree
        checkable={props?.checkable ?? true}
        checkStrictly={checkStrictly}
        fieldNames={{ title: 'label', key: 'id', children: 'children' }}
        style={{
          border: '1px solid #d9d9d9',
          borderRadius: 6,
          borderTop: 0,
          borderTopLeftRadius: 0,
          borderTopRightRadius: 0,
          padding: 10,
          height: 300,
          overflow: 'hidden auto',
          ...props.treeStyle,
        }}
        onExpand={(expandedKeysValue: React.Key[]) => {
          setExpandedKeys(expandedKeysValue);
        }}
        expandedKeys={expandedKeys}
        autoExpandParent={true}
        onCheck={(checkedKeysValue: any) => {
          let keys = checkedKeysValue;
          if (checkStrictly) {
            keys = checkedKeysValue.checked;
          }
          setCheckedKeys(keys);
          props?.onChecked?.(keys);
        }}
        checkedKeys={checkedKeys}
        onSelect={(selectedKeysValue: React.Key[]) => {
          setSelectedKeys(selectedKeysValue);
          props?.onSelected?.(selectedKeysValue);
        }}
        selectedKeys={selectedKeys}
        treeData={treeData}
      />
    </div>
  );
};

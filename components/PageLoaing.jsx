import { Spin } from 'antd'
export default () => (
  <>
  <div className="root_loading">
    <Spin />
  </div>
  <style jsx globle>{`
    .root_loading {
      position: fixed;
      top: 0;
      left: 0;
      bottom: 0;
      right: 0;
      display: flex;
      justify-content: center;
      align-items: center;
      background: rgba(255, 255, 255, .3);
      z-index: 1000
    }
  `}</style>
  </>
)
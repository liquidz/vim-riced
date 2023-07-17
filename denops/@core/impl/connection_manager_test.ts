import { asserts } from "../test_deps.ts";
import * as sut from "./connection_manager.ts";
import * as helper from "./test_helper.ts";

Deno.test("addConnection", () => {
  const manager = new sut.ConnectionManagerImpl();
  const conn = helper.dummyConnection({});

  asserts.assertEquals(manager.connections, {});

  asserts.assertEquals(manager.addConnection(conn), true);
  asserts.assertEquals(manager.addConnection(conn), false);

  asserts.assertEquals(manager.connections, { [conn.id]: conn });
});

Deno.test("getConnection", () => {
  const manager = new sut.ConnectionManagerImpl();
  const conn = helper.dummyConnection({});

  asserts.assertEquals(manager.getConnection(conn.id), undefined);
  manager.addConnection(conn);
  asserts.assertEquals(manager.getConnection(conn.id), conn);
});

Deno.test("removeConnection", async () => {
  const manager = new sut.ConnectionManagerImpl();
  const conn = helper.dummyConnection({});

  asserts.assertEquals(await manager.removeConnection(conn.id), false);

  manager.addConnection(conn);
  asserts.assertEquals(manager.getConnection(conn.id), conn);
  asserts.assertEquals(await manager.removeConnection(conn.id), true);
  asserts.assertEquals(manager.getConnection(conn.id), undefined);
});

Deno.test("removeAllConnections", async () => {
  const manager = new sut.ConnectionManagerImpl();
  const conn1 = helper.dummyConnection({ port: 123 });
  const conn2 = helper.dummyConnection({ port: 456 });

  manager.addConnection(conn1);
  manager.addConnection(conn2);

  asserts.assertEquals(manager.getConnection(conn1.id), conn1);
  asserts.assertEquals(manager.getConnection(conn2.id), conn2);

  await manager.removeAllConnections();

  asserts.assertEquals(manager.getConnection(conn1.id), undefined);
  asserts.assertEquals(manager.getConnection(conn2.id), undefined);
});

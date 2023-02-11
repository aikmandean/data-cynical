import { describe, it } from "vitest"
import * as expect from "assert"
import { unionAlias, unionCmd, unionFrom } from "./@types"
import { parseMacro } from "./@private"
import { renderQueryComplete, renderQuerySingle } from "."

describe("writer-macros", () => (
    it("alias select", () => 
        expect.equal(
            "SELECT (contactId) AS idx\nFROM ContactId",
            renderQuerySingle({
                anyCmd: { is: "cmdSelect" },
                anyFrom: { is: "fromRaw", raw: "ContactId" },
                toAlias: { 
                    idx: { is: "aliasDefCol", def: "contactId" } 
                },
                toFunc: {}, toJoin: []
            })
        )
    ),
    it("alias where", () => 
        expect.equal(
            "SELECT (contactId) AS idx\nFROM ContactId\nWHERE (contactId) = 4",
            renderQuerySingle({
                anyCmd: { is: "cmdWhere", condition: "idx = 4" },
                anyFrom: { is: "fromRaw", raw: "ContactId" },
                toAlias: { 
                    idx: { is: "aliasDefCol", def: "contactId" } 
                },
                toFunc: {}, toJoin: []
            })
        )
    ),
    it("alias raw", () => 
        expect.equal(
            "SELECT (contactId) AS index\nFROM ContactId\nWHERE (contactId) = 4",
            renderQuerySingle({
                anyCmd: { is: "cmdRaw", raw: "SELECT idx AS index\nFROM ContactId\nWHERE idx = 4" },
                anyFrom: { is: "fromRaw", raw: "ContactId" },
                toAlias: { 
                    idx: { is: "aliasDefCol", def: "contactId" } 
                },
                toFunc: {}, toJoin: []
            })
        )
    ),
    it("func select", () => 
        expect.equal(
            "SELECT (substr(firstName, 1)) AS firstInitial,\n\t"+
            "(substr(lastName, 1)) AS lastInitial,\n\t"+
            "(concat((substr(firstName, 1)), '. ', (substr(lastName, 1)), '.')) AS initials\nFROM Contacts",
            renderQuerySingle({
                anyCmd: { is: "cmdSelect" },
                anyFrom: { is: "fromRaw", raw: "Contacts" },
                toAlias: { 
                    firstInitial: { is: "aliasCall", call: "firstLetter", params: { col: "firstName" } },
                    lastInitial: { is: "aliasCall", call: "firstLetter", params: { col: "lastName" } },
                    initials: { is: "aliasCall", call: "abv2", params: { col1: "firstInitial", col2: "lastInitial" } },
                },
                toFunc: { 
                    firstLetter: { def: "substr(col, 1)", params: { col: "" } },
                    abv2: { def: "concat(col1, '. ', col2, '.')", params: { col1: "", col2: "" } }
                },
                toJoin: []
            })
        )
    ),
    it("func where", () => 
        expect.equal(
            "SELECT (substr(firstName, 1)) AS firstInitial,\n\t"+
            "(substr(lastName, 1)) AS lastInitial,\n\t"+
            "(concat((substr(firstName, 1)), '. ', (substr(lastName, 1)), '.')) AS initials\n"+
            "FROM Contacts\n"+
            "WHERE (substr(lastName, 1)) = 'D'",
            renderQuerySingle({
                anyCmd: { is: "cmdWhere", condition: "lastInitial = 'D'" },
                anyFrom: { is: "fromRaw", raw: "Contacts" },
                toAlias: { 
                    firstInitial: { is: "aliasCall", call: "firstLetter", params: { col: "firstName" } },
                    lastInitial: { is: "aliasCall", call: "firstLetter", params: { col: "lastName" } },
                    initials: { is: "aliasCall", call: "abv2", params: { col1: "firstInitial", col2: "lastInitial" } },
                },
                toFunc: { 
                    firstLetter: { def: "substr(col, 1)", params: { col: "" } },
                    abv2: { def: "concat(col1, '. ', col2, '.')", params: { col1: "", col2: "" } }
                },
                toJoin: []
            })
        )
    ),
    it("func raw", () => 
        expect.equal(
            "SELECT (concat((substr(firstName, 1)), '. ', (substr(lastName, 1)), '.')) AS nameCode FROM Contacts",
            renderQuerySingle({
                anyCmd: { is: "cmdRaw", raw: "SELECT initials AS nameCode FROM Contacts" },
                anyFrom: { is: "fromRaw", raw: "Contacts" },
                toAlias: { 
                    firstInitial: { is: "aliasCall", call: "firstLetter", params: { col: "firstName" } },
                    lastInitial: { is: "aliasCall", call: "firstLetter", params: { col: "lastName" } },
                    initials: { is: "aliasCall", call: "abv2", params: { col1: "firstInitial", col2: "lastInitial" } },
                },
                toFunc: { 
                    firstLetter: { def: "substr(col, 1)", params: { col: "" } },
                    abv2: { def: "concat(col1, '. ', col2, '.')", params: { col1: "", col2: "" } }
                }, 
                toJoin: []
            })
        )
    )
))

describe("writer-join", () => (
    it("single", () =>
        expect.equal(
            "SELECT (firstName) AS firstName,\n\t(lastName) AS lastName,\n\t(telephone) AS telephone,\n\t(email) AS email\n"+
            "FROM Contacts\n"+
            "INNER JOIN ContactId ON\n\t"+
            "ContactId.contactId = Contacts.contactId",
            renderQuerySingle({
                anyCmd: { is: "cmdSelect" },
                anyFrom: { is: "fromRaw", raw: "Contacts" },
                toAlias: {
                    firstName: { is: "aliasDefCol", def: "firstName" },
                    lastName: { is: "aliasDefCol", def: "lastName" },
                    telephone: { is: "aliasDefCol", def: "telephone" },
                    email: { is: "aliasDefCol", def: "email" },
                },
                toFunc: {},
                toJoin: [{ type: "INNER", to: "ContactId", on: "ContactId.contactId = Contacts.contactId"}]
            })
        )
    ),
    it("multi", () => 
        expect.equal(
            "SELECT (Messages.text) AS messageText,"+
            "\n\t(substr(lastName, 1)) AS senderLastInitial"+
            "\nFROM Messages"+
            "\nINNER JOIN ContactId ON"+
            "\n\tContactId.contactId = Messages.sender"+
            "\nINNER JOIN Contacts ON"+
            "\n\tContacts.contactId = ContactId.contactId"+
            "\nWHERE (substr(lastName, 1)) = 'D'"
            ,
            renderQuerySingle({
                anyCmd: { is: "cmdWhere", condition: "senderLastInitial = 'D'" },
                anyFrom: { is: "fromRaw", raw: "Messages" },
                toAlias: {
                    messageText: { is: "aliasDefCol", def: "Messages.text" },
                    senderLastInitial: { is: "aliasCall", call: "firstLetter", params: { col: "lastName" } }
                },
                toFunc: {
                    firstLetter: { def: "substr(col, 1)", params: { col: "" } }
                },
                toJoin: [
                    { type: "INNER", to: "ContactId", on: "ContactId.contactId = Messages.sender"},
                    { type: "INNER", to: "Contacts", on: "Contacts.contactId = ContactId.contactId"}
                ]
            })
        )
    )
))

describe("writer-from", () => (
    it("use", () => 
        expect.equal(
            "SELECT (contactId) AS contactId\nFROM ContactId",
            renderQuerySingle({
                anyCmd: { is: "cmdSelect" },
                anyFrom: { is: "fromUse", use: "ContactId" },
                toAlias: { contactId: { is: "aliasDefCol", def: "contactId" } }, 
                toFunc: {}, toJoin: []
            })
        )
    ),
    it("raw", () => 
        expect.equal(
            "SELECT (contactId) AS contactId\nFROM ContactId",
            renderQuerySingle({
                anyCmd: { is: "cmdSelect" },
                anyFrom: { is: "fromRaw", raw: "ContactId" },
                toAlias: { contactId: { is: "aliasDefCol", def: "contactId" } }, 
                toFunc: {}, toJoin: []
            })
        )
    ),
    it("full use", () => 
        expect.equal(
            "WITH\n\t"+
            "ViewContacts AS (\n\t\t"+
            "SELECT (lastName) AS lastName,\n\t\t\t"+
            "(telephone) AS telephone\n\t\t"+
            "FROM Contacts\n\t\t"+
            "INNER JOIN ContactId ON\n\t\t\t"+
            "ContactId.contactId = Contacts.contactId"+
            "\n\t)\n"+
            "SELECT (lastName) AS lastName,\n\t"+
            "(telephone) AS telephone"+
            "\nFROM ViewContacts",
            renderQueryComplete({
                toQuery: {
                    anyCmd: { is: "cmdSelect" },
                    anyFrom: { is: "fromUse", use: "ViewContacts" },
                    toAlias: { 
                        lastName: { is: "aliasDefCol", def: "lastName" },
                        telephone: { is: "aliasDefCol", def: "telephone" },
                    }, 
                    toFunc: {}, toJoin: []
                },
                toQueries: {
                    ViewContacts: {
                        anyCmd: { is: "cmdSelect" },
                        anyFrom: { is: "fromRaw", raw: "Contacts" },
                        toAlias: {
                            lastName: { is: "aliasDefCol", def: "lastName" },
                            telephone: { is: "aliasDefCol", def: "telephone" },
                        },
                        toFunc: {}, 
                        toJoin: [{ type: "INNER", to: "ContactId", on: "ContactId.contactId = Contacts.contactId" }]
                    }
                }
            })
        )
    ),
    it("full use multi", () => 
        expect.equal(
            "WITH\n\t"+
            "ViewContacts AS (\n\t\t"+
            "SELECT (lastName) AS lastName,\n\t\t\t"+
            "(telephone) AS telephone\n\t\t"+
            "FROM Contacts\n\t\t"+
            "INNER JOIN ViewContactsDuplicate ON\n\t\t\t"+
            "ViewContactsDuplicate.contactId = Contacts.contactId"+
            "\n\t),\n\t"+
            "ViewContactsDuplicate AS (\n\t\t"+
            "SELECT (lastName) AS lastName,\n\t\t\t"+
            "(telephone) AS telephone\n\t\t"+
            "FROM Contacts\n\t\t"+
            "INNER JOIN ContactId ON\n\t\t\t"+
            "ContactId.contactId = Contacts.contactId"+
            "\n\t)\n"+
            "SELECT (lastName) AS lastName,\n\t"+
            "(telephone) AS telephone"+
            "\nFROM ViewContacts",
            renderQueryComplete({
                toQuery: {
                    anyCmd: { is: "cmdSelect" },
                    anyFrom: { is: "fromUse", use: "ViewContacts" },
                    toAlias: { 
                        lastName: { is: "aliasDefCol", def: "lastName" },
                        telephone: { is: "aliasDefCol", def: "telephone" },
                    }, 
                    toFunc: {}, toJoin: []
                },
                toQueries: {
                    ViewContacts: {
                        anyCmd: { is: "cmdSelect" },
                        anyFrom: { is: "fromRaw", raw: "Contacts" },
                        toAlias: {
                            lastName: { is: "aliasDefCol", def: "lastName" },
                            telephone: { is: "aliasDefCol", def: "telephone" },
                        },
                        toFunc: {}, 
                        toJoin: [{ type: "INNER", to: "ViewContactsDuplicate", on: "ViewContactsDuplicate.contactId = Contacts.contactId" }]
                    },
                    ViewContactsDuplicate: {
                        anyCmd: { is: "cmdSelect" },
                        anyFrom: { is: "fromRaw", raw: "Contacts" },
                        toAlias: {
                            lastName: { is: "aliasDefCol", def: "lastName" },
                            telephone: { is: "aliasDefCol", def: "telephone" },
                        },
                        toFunc: {}, 
                        toJoin: [{ type: "INNER", to: "ContactId", on: "ContactId.contactId = Contacts.contactId" }]
                    }
                }
            })
        )
    ),
    it("full use pruned", () => 
        expect.equal(
            "WITH\n\t"+
            "ViewContacts AS (\n\t\t"+
            "SELECT (lastName) AS lastName,\n\t\t\t"+
            "(telephone) AS telephone\n\t\t"+
            "FROM Contacts\n\t\t"+
            "INNER JOIN ContactId ON\n\t\t\t"+
            "ContactId.contactId = Contacts.contactId"+
            "\n\t)\n"+
            "SELECT (lastName) AS lastName,\n\t"+
            "(telephone) AS telephone"+
            "\nFROM ViewContacts",
            renderQueryComplete({
                toQuery: {
                    anyCmd: { is: "cmdSelect" },
                    anyFrom: { is: "fromUse", use: "ViewContacts" },
                    toAlias: { 
                        lastName: { is: "aliasDefCol", def: "lastName" },
                        telephone: { is: "aliasDefCol", def: "telephone" },
                    }, 
                    toFunc: {}, toJoin: []
                },
                toQueries: {
                    ViewContacts: {
                        anyCmd: { is: "cmdSelect" },
                        anyFrom: { is: "fromRaw", raw: "Contacts" },
                        toAlias: {
                            lastName: { is: "aliasDefCol", def: "lastName" },
                            telephone: { is: "aliasDefCol", def: "telephone" },
                        },
                        toFunc: {}, 
                        toJoin: [{ type: "INNER", to: "ContactId", on: "ContactId.contactId = Contacts.contactId" }]
                    },
                    ViewContactsDuplicateButNotUsed: {
                        anyCmd: { is: "cmdSelect" },
                        anyFrom: { is: "fromRaw", raw: "Contacts" },
                        toAlias: {
                            lastName: { is: "aliasDefCol", def: "lastName" },
                            telephone: { is: "aliasDefCol", def: "telephone" },
                        },
                        toFunc: {}, 
                        toJoin: [{ type: "INNER", to: "ContactId", on: "ContactId.contactId = Contacts.contactId" }]
                    }
                }
            })
        )
    )
))

describe("parseMacro", () => (
    it("nested aliases", () =>
        expect.deepEqual({
                outAlias: {
                    dateSent: 'messageSent',
                    isRecent: '(messageSent) > thisWeekStart'
                }
            },
            parseMacro({
                toAlias: {
                    dateSent: { is: "aliasDefCol", def: "messageSent" },
                    isRecent: { is: "aliasDefExpr", def: "dateSent > thisWeekStart" }
                },
                toFunc: {}
            })
        )
    ),
    it("alias using funcs", () =>
        expect.deepEqual({
                outAlias: {
                    lastInitial: "left(lastName, 1)"
                }
            },
            parseMacro({
                toAlias: { lastInitial: { is: "aliasCall", call: "firstLetter", params: { col: "lastName" } } },
                toFunc: { firstLetter: { def: "left(col, 1)", params: { col: "" } } }
            })
        )
    )
))

describe("unionAlias", () => (
    it("match on call", () => 
        expect.equal("call", unionAlias
            ({
                aliasCall: call => "call",
                aliasDefCol: def => "def",
                aliasDefExpr: def => "def"
            })
            ({ is: "aliasCall" })
            ({ is: "aliasCall", call: "upper", params: { str: "firstName" } })
        )
    ),
    it("match on def", () => 
        expect.equal("def", unionAlias
            ({
                aliasCall: call => "call" as const,
                aliasDefCol: def => "def" as const,
                aliasDefExpr: def => "def" as const
            })
            ({ is: "aliasDefCol" })
            ({ is: "aliasDefCol", def: "firstName" })
        )
    ),
    it("match on possibly either", () => 
        expect.equal("def", unionAlias
            ({
                aliasCall: call => "call" as const,
                aliasDefCol: def => "def" as const,
                aliasDefExpr: def => "def" as const
            })
            ({ is: "aliasDefCol" as "aliasDefCol"|"aliasCall" })
            ({ is: "aliasDefCol", def: "firstName" })
        )
    )
))

describe("unionFrom", () => (
    it("match on use", () => 
        expect.equal("use", unionFrom
            ({
                fromRaw: raw => "raw" as const,
                fromUse: use => "use" as const
            })
            ({ is: "fromUse" })
            ({ is: "fromUse", use: "Messages" })
        )
    ),
    it("match on raw", () => 
        expect.equal("raw", unionFrom
            ({
                fromRaw: raw => "raw" as const,
                fromUse: use => "use" as const
            })
            ({ is: "fromRaw" })
            ({ is: "fromRaw", raw: "SELECT * FROM Messages" })
        )
    )
))

describe("unionCmd", () => (
    it("match on select", () =>
        expect.equal("select", unionCmd
            ({
                cmdRaw: raw => "raw" as const,
                cmdSelect: select => "select" as const,
                cmdWhere: where => "where" as const
            })
            ({ is: "cmdSelect" })
            ({ is: "cmdSelect" })
        )
    ),
    it("match on raw", () =>
        expect.equal("raw", unionCmd
            ({
                cmdRaw: raw => "raw" as const,
                cmdSelect: select => "select" as const,
                cmdWhere: where => "where" as const
            })
            ({ is: "cmdRaw" })
            ({ is: "cmdRaw", raw: "SELECT * FROM Messages" })
        )
    ),
    it("match on where", () =>
        expect.equal("where", unionCmd
            ({
                cmdRaw: raw => "raw" as const,
                cmdSelect: select => "select" as const,
                cmdWhere: where => "where" as const
            })
            ({ is: "cmdWhere" })
            ({ is: "cmdWhere", condition: "text LIKE '%hello%'" })
        )
    )
))
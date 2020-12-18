const fs = require("fs");
const path = require("path");

const faker = require("faker");

const replace = require("../src/replace");

const fileWithoutInfo = path.join(__dirname, ".env.no.info.test");
const fileWithStackedData = path.join(__dirname, "info.stk.docx");
const fileWithInfoSpread = path.join(__dirname, "info.sp.txt");

const LABEL1 = "hi guys!";
const LABEL2 = "what is up?";
const LABEL3 = "is everything ok?";
const LABEL4 = "good, glad to here that from you";
const LABEL5 = "don't worry";
const LABEL6 = "this test";
const LABEL7 = "cannot be last forever";
const LABEL8 = "right?";
const LABEL9 = "what!!";

const phrase1 = {
  regex: LABEL1,
  replace: "replace with new 1",
};
const phrase2 = {
  regex: new RegExp(`${LABEL2}`),
  replace: "replace with new 2",
};
const phrase3 = {
  regex: LABEL3,
  replace: "replace with new 3",
};
const phrase4 = {
  regex: LABEL4,
  replace: "replace with new 4",
};
const phrase5 = {
  regex: new RegExp(`${LABEL5}`),
  replace: "replace with new 5",
};
const phrase6 = {
  regex: LABEL6,
  replace: "replace with new 6",
};
const phrase7 = {
  regex: LABEL7,
  replace: "replace with new 7",
};
const phrase8 = {
  regex: new RegExp(`${LABEL8}`),
  replace: "replace with new 8",
};
const phrase9 = {
  regex: /what!!/gi,
  replace: "replace with new 9",
};

const request = [
  phrase1,
  phrase2,
  phrase3,
  phrase4,
  phrase5,
  phrase6,
  phrase7,
  phrase8,
  phrase9,
];

describe("Testing invalid input", () => {
  it("throws an error for empty args", async () => {
    await expect(replace()).rejects.toThrow("Invalid input");
  });

  it("throws an error when no request is provided", async () => {
    await expect(replace({})).rejects.toThrow("Invalid input");
  });

  it("throws an error when request is not an array", async () => {
    await expect(replace({ request: "" })).rejects.toThrow("Invalid input");
  });

  it("throws an error when for invalid regex", async () => {
    await expect(replace({ request: [9] })).rejects.toThrow("Invalid request");
  });

  it("throws an error when no path in applied", async () => {
    await expect(
      replace({ request: [{ regex: "", replace: "" }] })
    ).rejects.toThrow("Invalid path");
  });
});

describe("Testing data spread in file", () => {
  beforeAll(() => {
    const ws1 = fs.createWriteStream(fileWithInfoSpread);

    for (let i = 0; i < 10000; i += 1) {
      if (i === 1000) {
        ws1.write(` ${LABEL1} `);
      } else if (i === 2000) {
        ws1.write(` ${LABEL2} `);
      } else if (i === 3000) {
        ws1.write(` ${LABEL3} `);
      } else if (i === 4000) {
        ws1.write(` ${LABEL4} `);
      } else if (i === 5000) {
        ws1.write(` ${LABEL5} `);
      } else if (i === 6000) {
        ws1.write(` ${LABEL6} `);
      } else if (i === 7000) {
        ws1.write(` ${LABEL7} `);
      } else if (i === 800) {
        ws1.write(` ${LABEL8} `);
      } else if (i === 800) {
        ws1.write(` ${LABEL9} `);
      } else {
        ws1.write(`${faker.lorem.paragraphs()}\n`);
      }
    }
    ws1.end();
  });

  afterAll(() => {
    fs.unlinkSync(fileWithInfoSpread);
  });

  it("replaces requested strings", async () => {
    const report = await replace({ path: fileWithInfoSpread, request });

    expect(Array.isArray(report)).toBeTruthy();

    expect(report[0]).toStrictEqual({
      isChanged: true,
      regex: phrase1.regex,
      replace: phrase1.replace,
    });

    expect(report).toMatchSnapshot();
  });
});

describe("Testing no match", () => {
  beforeAll(() => {
    const ws2 = fs.createWriteStream(fileWithoutInfo);

    for (let i = 0; i < 10000; i += 1) {
      ws2.write(`${faker.lorem.paragraphs()}\n`);
    }

    ws2.end();
  });

  afterAll(() => {
    fs.unlinkSync(fileWithoutInfo);
  });

  it("returns isChanged false", async () => {
    const report = await replace({ path: fileWithoutInfo, request });

    expect(Array.isArray(report)).toBeTruthy();

    expect(report[0]).toStrictEqual({
      isChanged: false,
      regex: phrase1.regex,
      replace: phrase1.replace,
    });

    expect(report[7]).toStrictEqual({
      isChanged: false,
      regex: phrase8.regex,
      replace: phrase8.replace,
    });

    expect(report).toMatchSnapshot();
  });
});

describe("Testing in stacked file", () => {
  beforeAll(() => {
    const ws3 = fs.createWriteStream(fileWithStackedData);

    ws3.write(` ${LABEL1} `);
    ws3.write(` ${LABEL2} `);
    ws3.write(` ${LABEL3} `);
    ws3.write(` ${LABEL4} `);
    ws3.write(` ${LABEL5} `);
    ws3.write(` ${LABEL6} `);
    ws3.write(` ${LABEL7} `);
    ws3.write(` ${LABEL8} `);
    ws3.write(` ${LABEL9} `);
    for (let i = 0; i < 10000; i += 1) {
      ws3.write(`${faker.lorem.paragraphs()}\n`);
    }
  });

  afterAll(() => {
    fs.unlinkSync(fileWithStackedData);
  });

  it("replaces requested strings", async () => {
    const report = await replace({ path: fileWithStackedData, request });

    expect(Array.isArray(report)).toBeTruthy();

    expect(report[0]).toStrictEqual({
      isChanged: true,
      regex: phrase1.regex,
      replace: phrase1.replace,
    });

    expect(report).toMatchSnapshot();
  });
});

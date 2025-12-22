import torch
import torch.nn as nn
import torch.nn.functional as F
import random
import string

ALL_CHARS = list(string.ascii_lowercase) + ["-", "'", " "]
SPECIAL_TOKENS = ["<pad>", "<sos>", "<eos>"]

itos = SPECIAL_TOKENS + ALL_CHARS
stoi = {ch: i for i, ch in enumerate(itos)}

PAD_IDX = stoi["<pad>"]
SOS_IDX = stoi["<sos>"]
EOS_IDX = stoi["<eos>"]

MAX_LEN = 16

def encode_word(word, add_sos=False, add_eos=False, max_len=MAX_LEN):
    seq = []
    if add_sos:
        seq.append(SOS_IDX)
    for ch in word:
        if ch.lower() in stoi:
            seq.append(stoi[ch.lower()])
    if add_eos:
        seq.append(EOS_IDX)

    seq = seq[:max_len]
    seq += [PAD_IDX] * (max_len - len(seq))
    return seq

def decode_seq(seq):
    chars = []
    for idx in seq:
        ch = itos[idx]
        if ch == "<eos>":
            break
        if ch not in SPECIAL_TOKENS:
            chars.append(ch)
    return "".join(chars)


class TypoSeq2Seq(nn.Module):
    def __init__(self, vocab_size, emb_dim=128, hidden_dim=256):
        super().__init__()
        self.emb = nn.Embedding(vocab_size, emb_dim, padding_idx=PAD_IDX)
        self.encoder = nn.LSTM(emb_dim, hidden_dim, batch_first=True)
        self.decoder = nn.LSTM(emb_dim, hidden_dim, batch_first=True)
        self.out = nn.Linear(hidden_dim, vocab_size)

    def encode(self, x):
        emb = self.emb(x)
        _, (h, c) = self.encoder(emb)
        return h, c

    def decode(self, x, h, c):
        emb = self.emb(x)
        out, _ = self.decoder(emb, (h, c))
        return self.out(out)


def sample_from_logits(logits, temp=0.8, top_k=8):
    logits = logits / temp
    v, idx = torch.topk(logits, top_k)
    probs = torch.softmax(v, dim=-1)
    choice = torch.multinomial(probs, 1).item()
    return idx[choice].item()


def generate_typo(model, word, temp=0.8):
    device = next(model.parameters()).device
    model.eval()

    with torch.no_grad():
        src = torch.tensor([encode_word(word, add_eos=True)], dtype=torch.long).to(device)
        h, c = model.encode(src)

        seq = [SOS_IDX]

        for _ in range(MAX_LEN):
            inp = torch.tensor([seq], dtype=torch.long).to(device)
            logits = model.decode(inp, h, c)[0, -1]

            nid = sample_from_logits(logits, temp=temp, top_k=8)

            if nid in (EOS_IDX, PAD_IDX):
                break

            seq.append(nid)

        return decode_seq(seq[1:])


def make_choices(model, word, n_fake=4):
    fakes = set()
    tries = 0

    while len(fakes) < n_fake and tries < 50:
        fake = generate_typo(model, word)
        tries += 1
        if fake and fake != word:
            fakes.add(fake)

    while len(fakes) < n_fake:
        fakes.add(word + random.choice("abcdefghijklmnopqrstuvwxyz"))

    fakes = list(fakes)
    choices = fakes + [word]
    random.shuffle(choices)
    return choices


def load_model(path="typo_model.pt"):
    device = "cuda" if torch.cuda.is_available() else "cpu"
    model = TypoSeq2Seq(len(itos)).to(device)

    state = torch.load(path, map_location=device)
    model.load_state_dict(state)

    return model

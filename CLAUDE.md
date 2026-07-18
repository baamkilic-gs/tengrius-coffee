# Tengrius Coffee — Claude Code Talimatları

## Bağlam Navigasyonu (Graphify)
1. **Önce:** kod yapısı ve bağlantılar için `graphify-out/graph.json` sorgula
   (worktree'de yoksa mutlak yol: `C:\Users\mehmet.kilic\Proje\tengrius-coffee\graphify-out\graph.json`)
2. **Sonra:** kararlar ve proje bağlamı için `~/vault/tengrius-coffee/` klasörüne bak
3. **En son:** yalnızca düzenleme yaparken ham kod dosyalarını oku

- Büyük refactor sonrası graf tazeleme: `graphify update .` veya `/graphify . --update`
- `graphify-out/` içini elle değiştirme; graf yanıtı içeriyorsa kod tabanını baştan okuma

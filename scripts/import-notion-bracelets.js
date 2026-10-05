const fs = require("node:fs");
const { createClient } = require("@supabase/supabase-js");

const rows = [
  {
    name: "Thạch anh hồng",
    price: 179000,
    qty: 2,
    features: "Loại đá (theo tên gọi): thạch anh hồng, một biến thể của quartz. Độ cứng tham khảo: 7 Mohs. Gam hồng phấn dịu, hạt có thể trong mờ hoặc có vân mây; phù hợp đeo thường ngày, tránh va đập mạnh.",
    highlight: "Một sắc hồng như lời nhắn chưa nói: dịu dàng, gần gũi và đủ nổi bật để người nhận nhớ mãi.",
    meaning: "Theo quan niệm phong thủy, thạch anh hồng tượng trưng cho tình yêu thương, sự hòa giải và lòng trân trọng bản thân. Phù hợp với người mong mở lòng với một mối quan hệ mới, vun đắp tình cảm hiện có hoặc chọn một món quà gửi lời yêu thương. Mang ý nghĩa cầu may về nhân duyên, không bảo đảm một kết quả cụ thể.",
    story: "Truyện sáng tác lấy cảm hứng từ sắc đá: Có cô thợ làm vườn cất một lời xin lỗi mãi không dám nói. Mỗi ngày cô đặt một viên đá hồng cạnh khóm hoa rồi học cách nói thật lòng. Đến khi hoa nở, lời xin lỗi cũng thành lời; chiếc vòng nhắc ta rằng yêu thương bắt đầu từ một bước nhỏ.",
  },
  {
    name: "Fluorite",
    price: 299000,
    qty: 1,
    features: "Loại đá (theo tên gọi): fluorite, khoáng vật canxi florua. Độ cứng tham khảo: 4 Mohs; dễ trầy hơn nhiều loại đá đeo tay khác, nên tránh cọ xát và va chạm. Đá thường có sắc xanh, tím hoặc các dải màu chuyển tiếp.",
    highlight: "Như mang theo một dải cực quang thu nhỏ: mỗi lần xoay tay, bảng màu lại kể một sắc thái khác.",
    meaning: "Trong quan niệm phong thủy, fluorite gắn với sự sáng suốt, tập trung và sắp xếp suy nghĩ. Hợp với người đang ôn thi, học kỹ năng mới hoặc đứng trước nhiều lựa chọn; có thể chọn làm biểu tượng cầu may cho việc học hành và những quyết định tỉnh táo. Ý nghĩa này mang tính tinh thần, không thay thế việc rèn luyện.",
    story: "Truyện sáng tác lấy cảm hứng từ các dải màu: Một người học việc lạc trong thư viện phép thuật, nơi mỗi cánh cửa chỉ mở khi cô gọi đúng điều mình tìm kiếm. Cô thôi chạy theo mọi lối và chọn một trang sách đầu tiên. Dải màu fluorite trở thành lời nhắc: sáng rõ bắt đầu từ một lựa chọn.",
  },
  {
    name: "Labradorite (Hắc nguyệt quang)",
    price: 499000,
    qty: 1,
    features: "Loại đá (theo tên gọi): labradorite, khoáng vật thuộc nhóm feldspar. Độ cứng tham khảo: 6-6,5 Mohs. Nền đá xám sẫm; một số hạt có hiệu ứng ánh xanh, lục hoặc vàng khi đổi góc nhìn dưới ánh sáng.",
    highlight: "Nền đá trầm tưởng như lặng im, rồi bất ngờ lóe ánh màu khi bắt đúng tia sáng.",
    meaning: "Theo quan niệm phong thủy, labradorite tượng trưng cho trực giác, sự tự tin và ranh giới cá nhân. Phù hợp với người đang bước vào công việc mới, thử một hướng đi khác hoặc mong giữ vững quyết định trước tác động bên ngoài. Có thể đeo như lời chúc may mắn cho những lần dám thay đổi.",
    story: "Truyện sáng tác lấy cảm hứng từ ánh đá: Người gác đêm trên mũi đất từng tin biển chỉ có màu đen. Một hôm, tia trăng chạm vào viên đá trong tay và vẽ ra vệt xanh dẫn đường về cảng. Từ đó, chiếc vòng kể rằng đôi khi ta chỉ cần đổi góc nhìn để thấy lối đi.",
  },
  {
    name: "Aquamarine",
    price: 499000,
    qty: 1,
    features: "Loại đá (theo tên gọi): aquamarine, biến thể xanh lam của beryl. Độ cứng tham khảo: 7,5-8 Mohs. Sắc xanh biển nhạt đến xanh lam, có thể hơi ngả lục; độ trong thay đổi tùy hạt.",
    highlight: "Một khoảng biển xanh ngay trên cổ tay, nhẹ mắt mà vẫn khiến người khác dừng lại nhìn.",
    meaning: "Trong quan niệm phong thủy, aquamarine gắn với bình tĩnh, giao tiếp chân thành và hành trình thuận lợi. Hợp với người sắp phỏng vấn, thuyết trình, bắt đầu cuộc trò chuyện quan trọng hoặc đi xa; mang ý nghĩa cầu may để lời nói rõ ràng và chuyến đi bình an. Không phải bảo chứng cho kết quả.",
    story: "Truyện sáng tác lấy cảm hứng từ biển: Trước chuyến vượt khơi, một người con mang theo giọt xanh mẹ trao và hứa sẽ trở về kể mọi điều chưa kịp nói. Suốt hành trình, giọt xanh nhắc cô giữ nhịp thở đều trước sóng lớn. Vòng đá mang ý nghĩa của một lời hẹn bình an.",
  },
  {
    name: "Dream Amethyst",
    price: 399000,
    qty: 1,
    features: "Loại đá (theo tên thương mại): Dream Amethyst, thường chỉ thạch anh tím có vân xen quartz trắng. Độ cứng tham khảo của quartz: 7 Mohs. Các mảng tím trắng có thể tạo vân chữ V hoặc vân sóng; từng hạt có họa tiết khác nhau.",
    highlight: "Vân tím trắng như bản đồ của một giấc mơ: càng nhìn gần, càng thấy nét riêng không hạt nào lặp lại.",
    meaning: "Theo quan niệm phong thủy, thạch anh tím gắn với sự tĩnh tâm, suy ngẫm và lắng nghe trực giác. Phù hợp với người mong bớt xao nhãng, dành thời gian nhìn lại bản thân hoặc bắt đầu thói quen viết nhật ký, thiền định; là biểu tượng cầu may cho sự sáng rõ trong nội tâm.",
    story: "Truyện sáng tác lấy cảm hứng từ vân đá: Một người vẽ bản đồ tìm kiếm giấc mơ bị bỏ quên, nhưng mọi lối mòn đều quay về căn phòng cũ. Đêm ấy, cô nhìn vân tím trắng như những khúc ngoặt và nhớ ra điều từng muốn làm. Chiếc vòng là dấu nhắc để bước tiếp từ nơi mình đang đứng.",
  },
  {
    name: "Mã não Diêm Nguyên",
    price: 499000,
    qty: 1,
    features: "Loại đá (theo tên gọi): mã não, một dạng chalcedony thuộc họ quartz; tên Diêm Nguyên cần thông tin nhà cung cấp để xác định phân loại cụ thể. Độ cứng tham khảo của mã não: 6,5-7 Mohs. Màu và vân có thể khác nhau giữa các hạt.",
    highlight: "Những đường vân như địa tầng thu nhỏ: một chiếc vòng có thể gợi cả câu chuyện về thời gian.",
    meaning: "Theo quan niệm phong thủy, mã não tượng trưng cho nền tảng vững vàng và sự bền bỉ. Hợp với người mong kiên trì theo đuổi dự định dài hạn, giữ nhịp làm việc ổn định hoặc bước qua một giai đoạn nhiều thay đổi; mang ý nghĩa cầu may cho sự thuận lợi và vững tâm.",
    story: "Truyện sáng tác lấy cảm hứng từ vân đá: Người thợ gốm thất bại bảy lần trước khi nung được chiếc bình đầu tiên. Anh nhặt viên đá có nhiều vòng vân và hiểu rằng mỗi lớp đều cần thời gian để thành hình. Chiếc vòng mang lời nhắn: điều bền đẹp được tạo nên bằng những lần tiếp tục.",
  },
  {
    name: "Prehnite",
    price: 499000,
    qty: 1,
    features: "Loại đá (theo tên gọi): prehnite, khoáng vật silicat canxi nhôm. Độ cứng tham khảo: 6-6,5 Mohs. Gam xanh non hoặc xanh vàng, thường trong mờ, gợi cảm giác mát và dịu.",
    highlight: "Xanh như chiếc lá đầu mùa: một chi tiết nhỏ khiến tổng thể trang phục bỗng tươi hơn.",
    meaning: "Trong quan niệm phong thủy, prehnite gắn với sự dịu lại, sắp xếp cảm xúc và chăm sóc những điều quan trọng. Phù hợp với người muốn giảm nhịp sống, tạo góc yên tĩnh cho bản thân hoặc bắt đầu thói quen sống cân bằng; là biểu tượng cầu may cho sự hài hòa trong các mối quan hệ.",
    story: "Truyện sáng tác lấy cảm hứng từ sắc xanh: Trong khu vườn bỏ quên, cô bé chỉ tưới một mầm cây mỗi sáng. Một mùa sau, tán lá đầu tiên đủ che cho người đi đường khỏi nắng. Chiếc vòng nhắc rằng bình yên thường lớn lên từ việc chăm sóc đều đặn.",
  },
  {
    name: "Thạch anh dâu tây",
    price: 449000,
    qty: 1,
    features: "Loại đá (theo tên thương mại): thạch anh dâu tây thường chỉ quartz có các bao thể tạo sắc hồng đỏ; tên gọi có thể dùng cho nhiều chất liệu, cần giám định để xác nhận từng vòng. Nếu đúng là quartz, độ cứng tham khảo: 7 Mohs. Hạt thường có chấm hoặc vệt màu nhỏ.",
    highlight: "Những chấm màu như vụn dâu trong ánh sáng, ngọt ngào mà vẫn đầy sức sống.",
    meaning: "Theo quan niệm phong thủy, sắc hồng đỏ của thạch anh dâu tây gợi niềm vui, sức sống và sự cởi mở trong tình cảm. Hợp với người mong thêm tự tin khi kết bạn, trân trọng bản thân hoặc tìm một món quà chúc may mắn về nhân duyên. Đây là ý nghĩa biểu tượng, không hứa hẹn thay đổi tình cảm.",
    story: "Truyện sáng tác lấy cảm hứng từ sắc dâu: Một cô gái trồng dâu luôn giữ quả đầu mùa cho người đến muộn nhất phiên chợ. Hôm ấy người nhận đã trở thành bạn cô suốt nhiều năm. Chiếc vòng kể về niềm vui đôi khi đến từ một cử chỉ nhỏ dành cho người khác.",
  },
  {
    name: "Mã não Diêm Nguyên",
    price: 219000,
    qty: 1,
    features: "Loại đá (theo tên gọi): mã não, một dạng chalcedony thuộc họ quartz; tên Diêm Nguyên cần thông tin nhà cung cấp để xác định phân loại cụ thể. Độ cứng tham khảo của mã não: 6,5-7 Mohs. Màu và vân có thể khác nhau giữa các hạt.",
    highlight: "Một dấu vân riêng trên cổ tay, như nhắc rằng hành trình của mỗi người không có bản sao.",
    meaning: "Theo quan niệm phong thủy, mã não gợi sự ổn định và niềm tin vào từng bước tiến nhỏ. Phù hợp với người đang gây dựng công việc, tiết kiệm cho mục tiêu mới hoặc mong giữ sự kiên định khi mọi việc chưa thuận; mang ý nghĩa cầu may cho một khởi đầu bền vững.",
    story: "Truyện sáng tác lấy cảm hứng từ vân đá: Người lữ hành đếm những con đường đã đi bằng các nét vân trên viên đá nhỏ. Khi lạc lối, anh nhìn lại và nhận ra mỗi vòng vân đều là một đoạn mình đã vượt qua. Chiếc vòng được kể như bùa nhắc nhớ sự bền bỉ, không phải bùa bảo đảm may mắn.",
  },
  {
    name: "Thạch anh tím vàng",
    price: 499000,
    qty: 1,
    features: "Loại đá (theo tên gọi): thạch anh tím vàng, thường được gọi ametrine khi sắc tím và vàng cùng hiện trong một tinh thể quartz; cần giám định để xác nhận từng vòng. Độ cứng tham khảo của quartz: 7 Mohs. Hai gam màu tạo đối lập rõ hoặc chuyển sắc tùy hạt.",
    highlight: "Hai sắc tím vàng trên một cổ tay: một nửa trầm tĩnh, một nửa rực sáng.",
    meaning: "Theo quan niệm phong thủy, sắc tím tượng trưng cho sự điềm tĩnh, sắc vàng gợi năng lượng và cơ hội. Hợp với người mong vừa suy nghĩ thấu đáo vừa dám bắt tay vào dự án mới; mang ý nghĩa cầu may cho việc chọn đúng hướng và nắm bắt thời cơ. Đây là liên tưởng biểu tượng.",
    story: "Truyện sáng tác lấy cảm hứng từ hai màu đá: Trong xưởng đồng hồ, hai chị em luôn tranh luận nên chờ thời điểm hoàn hảo hay bắt đầu ngay. Họ cùng làm một chiếc kim có hai sắc: tím để nghĩ kỹ, vàng để bước tới. Chiếc vòng kể về khoảnh khắc hai điều ấy gặp nhau.",
  },
  {
    name: "Green Aventurine (Thạch anh xanh)",
    price: 299000,
    qty: 1,
    features: "Loại đá (theo tên gọi): green aventurine, một dạng quartz xanh có thể có điểm ánh mịn do bao thể. Độ cứng tham khảo: 6,5-7 Mohs. Sắc xanh lá từ nhạt đến đậm, dễ phối với màu trắng, kem hoặc nâu.",
    highlight: "Một mảng xanh như mầm cây bật lên giữa ngày thường, dễ nhìn thấy và dễ ghi nhớ.",
    meaning: "Trong quan niệm phong thủy, aventurine xanh được xem là biểu tượng của cơ hội, sự phát triển và tinh thần lạc quan. Hợp với người chuẩn bị ứng tuyển, khởi động dự án hoặc mong có thêm động lực trước mục tiêu tài chính; mang ý nghĩa cầu may cho việc nhận ra cơ hội và chủ động hành động.",
    story: "Truyện sáng tác lấy cảm hứng từ màu lá: Trên mảnh đất tưởng đã cằn, người làm vườn vẫn gieo một hạt mỗi mùa. Mùa xuân năm ấy, mầm xanh đầu tiên xuất hiện đúng nơi anh từng định bỏ cuộc. Chiếc vòng nhắc rằng cơ hội cần cả hy vọng lẫn hành động.",
  },
];

function readEnv() {
  return Object.fromEntries(
    fs
      .readFileSync(".env.local", "utf8")
      .split(/\r?\n/)
      .filter((line) => line.trim() && !line.trim().startsWith("#"))
      .map((line) => {
        const index = line.indexOf("=");
        return [line.slice(0, index).trim(), line.slice(index + 1).trim()];
      }),
  );
}

function slugify(value) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-+/g, "-") || "san-pham";
}

function short(value, length = 320) {
  return value.length > length ? `${value.slice(0, length - 1).trim()}...` : value;
}

async function upsertStone(supabase, row, profileId) {
  const slug = slugify(row.name);
  const payload = {
    name: row.name,
    slug,
    short_description: short(row.features),
    content: `## Đặc điểm\n${row.features}\n\n## Ý nghĩa tham khảo\n${row.meaning}\n\n## Câu chuyện\n${row.story}`,
    benefits: row.meaning,
    suitable_for: null,
    elements: [],
    zodiac_signs: [],
    colors: [],
    origin: null,
    featured_image: null,
    gallery: [],
    status: "draft",
    is_featured: false,
    seo_title: null,
    seo_description: null,
    created_by: profileId,
    published_at: null,
  };

  const { data: existing, error: existingError } = await supabase
    .from("stones")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();
  if (existingError) throw existingError;

  if (existing) {
    const { data, error } = await supabase.from("stones").update(payload).eq("id", existing.id).select("id").single();
    if (error) throw error;
    return data.id;
  }

  const { data, error } = await supabase.from("stones").insert(payload).select("id").single();
  if (error) throw error;
  return data.id;
}

async function main() {
  const env = readEnv();
  const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SECRET_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id")
    .eq("role", "admin")
    .eq("is_active", true)
    .limit(1)
    .single();
  if (profileError) throw profileError;

  const usedSlugs = {};
  const imported = [];

  for (let index = 0; index < rows.length; index += 1) {
    const row = rows[index];
    const baseSlug = slugify(row.name);
    usedSlugs[baseSlug] = (usedSlugs[baseSlug] || 0) + 1;
    const slug = usedSlugs[baseSlug] === 1 ? baseSlug : `${baseSlug}-${usedSlugs[baseSlug]}`;
    const stoneId = await upsertStone(supabase, row, profile.id);

    const content = `## Điểm nhấn\n${row.highlight}\n\n## Đặc điểm\n${row.features}\n\n## Câu chuyện\n${row.story}\n\n## Ghi chú nhập liệu\nDữ liệu được nhập từ Notion page Huyền Cảnh Các. Sản phẩm đang ở bản nháp vì cần bổ sung ảnh thật, kích thước hạt và kích cỡ vòng trước khi công khai.`;
    const payload = {
      name: row.name,
      slug,
      featured_image: "",
      short_description: row.highlight,
      content,
      bead_sizes_mm: [0],
      wrist_sizes_cm: ["Cần cập nhật"],
      gallery: [],
      colors: [],
      style: "Vòng tay",
      bead_count: null,
      cord_material: null,
      accessory_material: null,
      price: row.price,
      availability: row.qty > 0 ? "available" : "out_of_stock",
      meaning: row.meaning,
      suitable_elements: [],
      wrist_measurement_guide: "Cần bổ sung hướng dẫn đo cổ tay và các cỡ vòng có thể cung cấp.",
      care_guide: "Cần bổ sung hướng dẫn sử dụng và bảo quản theo chất liệu thực tế.",
      policy: "Cần bổ sung chính sách điều chỉnh kích cỡ, bảo hành hoặc đổi trả.",
      origin: null,
      treatment: null,
      certification: null,
      is_featured: false,
      display_order: index,
      status: "draft",
      seo_title: null,
      seo_description: short(row.highlight, 320),
      published_at: null,
      created_by: profile.id,
      deleted_at: null,
    };

    const { data: existing, error: existingError } = await supabase
      .from("bracelets")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();
    if (existingError) throw existingError;

    let bracelet;
    if (existing) {
      const { data, error } = await supabase
        .from("bracelets")
        .update(payload)
        .eq("id", existing.id)
        .select("id,product_code,name,slug,status")
        .single();
      if (error) throw error;
      bracelet = data;
    } else {
      const { data, error } = await supabase
        .from("bracelets")
        .insert(payload)
        .select("id,product_code,name,slug,status")
        .single();
      if (error) throw error;
      bracelet = data;
    }

    const { error: deleteLinkError } = await supabase.from("bracelet_stones").delete().eq("bracelet_id", bracelet.id);
    if (deleteLinkError) throw deleteLinkError;
    const { error: linkError } = await supabase
      .from("bracelet_stones")
      .insert({ bracelet_id: bracelet.id, stone_id: stoneId, display_order: 0 });
    if (linkError) throw linkError;
    imported.push(bracelet);
  }

  const { count, error: countError } = await supabase.from("bracelets").select("id", { count: "exact", head: true });
  if (countError) throw countError;
  console.log(JSON.stringify({ imported: imported.length, totalBracelets: count, items: imported }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
